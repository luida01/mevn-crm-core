import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Manga from '../models/Manga';
import MangaSeries, { IMangaSeries } from '../models/MangaSeries';
import Rental from '../models/Rental';
import axios from 'axios';
import { pickRequestFields } from '../utils/requestBody';
import { resolveMangaSeries, serializeManga, serializeMangas } from '../services/mangaSeries';

interface JikanMangaSearchResult {
    mal_id: number;
    title: string;
    title_english?: string | null;
    authors?: Array<{ name: string }>;
    genres?: Array<{ name: string }>;
    synopsis?: string | null;
    images?: { jpg?: { image_url?: string | null } };
    published?: { from?: string | null };
    status?: string | null;
    score?: number | null;
}

interface JikanSearchResponse {
    data: JikanMangaSearchResult[];
}

interface MangaDexRelationship {
    id: string;
    type: string;
    attributes?: { name?: string; fileName?: string };
}

interface MangaDexSearchResult {
    id: string;
    attributes: {
        title: Record<string, string>;
        altTitles?: Array<Record<string, string>>;
        description?: Record<string, string>;
        year?: number | null;
        status?: string;
        links?: { mal?: string };
        originalLanguage?: string;
        tags?: Array<{ attributes?: { group?: string; name?: Record<string, string> } }>;
    };
    relationships: MangaDexRelationship[];
}

interface MangaDexSearchResponse {
    data: MangaDexSearchResult[];
}

interface MangaDexCover {
    attributes: {
        volume: string | null;
        fileName: string;
        locale: string;
    };
}

interface MangaDexCoverResponse {
    data: MangaDexCover[];
    total: number;
}

interface MangaDexSingleResponse {
    data: MangaDexSearchResult;
}

interface AvailableMangaVolume {
    volume: number;
    coverImage: string;
    locale: string;
}

const normalizeJikanManga = (item: JikanMangaSearchResult) => {
    let authorName = item.authors?.[0]?.name || 'Unknown';
    if (authorName.includes(', ')) {
        const [lastName, firstName] = authorName.split(', ');
        authorName = `${firstName} ${lastName}`;
    }

    const publishedDate = item.published?.from ? new Date(item.published.from) : null;
    return {
        title: item.title_english || item.title,
        author: authorName,
        genre: item.genres?.map((genre) => genre.name).join(', ') || 'Unknown',
        description: item.synopsis || '',
        coverImage: item.images?.jpg?.image_url || null,
        publishedYear: publishedDate && !Number.isNaN(publishedDate.getTime()) ? publishedDate.getFullYear() : null,
        status: item.status || 'Unknown',
        malScore: item.score ?? null,
        malId: String(item.mal_id),
        provider: 'MyAnimeList',
        price: 0,
        rentalPrice: 0,
        stock: 0
    };
};

const normalizeMangaDexManga = (item: MangaDexSearchResult) => {
    const titles = [item.attributes.title, ...(item.attributes.altTitles || [])];
    const getLocalizedText = (values: Record<string, string> | undefined): string => {
        if (!values) return '';
        return values.en || values['en-us'] || values['ja-ro'] || values.ja || Object.values(values)[0] || '';
    };
    const author = item.relationships
        .filter((relationship) => relationship.type === 'author' || relationship.type === 'artist')
        .map((relationship) => relationship.attributes?.name)
        .filter((name): name is string => Boolean(name))
        .join(', ') || 'Unknown';
    const coverFile = item.relationships.find((relationship) => relationship.type === 'cover_art')?.attributes?.fileName;
    const tags = (item.attributes.tags || [])
        .filter((tag) => tag.attributes?.group === 'genre' || tag.attributes?.group === 'demographic')
        .map((tag) => getLocalizedText(tag.attributes?.name))
        .filter(Boolean);
    const malId = item.attributes.links?.mal;

    return {
        title: getLocalizedText(item.attributes.title) || getLocalizedText(titles[0]),
        alternativeTitles: titles.slice(1).map(getLocalizedText).filter(Boolean),
        author,
        genre: [...new Set(tags)].join(', ') || 'Unknown',
        description: getLocalizedText(item.attributes.description) || '',
        coverImage: coverFile ? `https://uploads.mangadex.org/covers/${item.id}/${coverFile}` : null,
        publishedYear: item.attributes.year || null,
        status: item.attributes.status === 'ongoing' ? 'Publishing' : item.attributes.status === 'completed' ? 'Finished' : item.attributes.status || 'Unknown',
        malScore: null,
        malId: malId ? String(malId) : null,
        mangaDexId: item.id,
        provider: 'MangaDex',
        price: 0,
        rentalPrice: 0,
        stock: 0
    };
};

interface MangaInput {
    title: string; volume: number; author: string; genre: string; isbn?: string;
    price: number; rentalPrice: number; stock: number; coverImage?: string;
    description?: string; publishedYear?: number; status?: string; malScore?: number;
    malId?: string; mangaDexId?: string; alternativeTitles?: string[];
}

const mangaFields: readonly (keyof MangaInput)[] = [
    'title', 'volume', 'author', 'genre', 'isbn', 'price', 'rentalPrice', 'stock',
    'coverImage', 'description', 'publishedYear', 'status', 'malScore', 'malId', 'mangaDexId', 'alternativeTitles'
] as const;

const seriesFieldNames = ['title', 'author', 'genre', 'description', 'publishedYear', 'status', 'malScore', 'malId', 'mangaDexId', 'alternativeTitles'] as const;
const volumeFieldNames = ['volume', 'isbn', 'coverImage', 'price', 'rentalPrice', 'stock'] as const;

// Get all mangas
export const addMangaStock = async (req: Request, res: Response) => {
    const quantity: unknown = req.body?.quantity;
    if (!mongoose.isValidObjectId(req.params.id) || typeof quantity !== 'number' || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100000) {
        res.status(400).json({ message: 'Indica una cantidad entera entre 1 y 100000.' }); return;
    }
    try {
        await Manga.findByIdAndUpdate(req.params.id, { $inc: { stock: quantity } }, { new: true, runValidators: true });
        const manga = await Manga.findById(req.params.id).populate('series');
        if (!manga) { res.status(404).json({ message: 'Manga not found' }); return; }
        res.json(serializeManga(manga));
    } catch (error: unknown) { console.error(error); res.status(500).json({ message: 'No se pudo añadir stock.' }); }
};

export const getMangas = async (req: Request, res: Response) => {
    try {
        const mangas = await Manga.find().populate('series').sort({ createdAt: -1 });
        res.json(serializeMangas(mangas));
    } catch (error: unknown) {
        console.error('Error fetching mangas:', error);
        res.status(500).json({ message: 'Error fetching mangas' });
    }
};

// Get single manga
export const getManga = async (req: Request, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).json({ message: 'Invalid manga id' });
        return;
    }

    try {
        const manga = await Manga.findById(req.params.id).populate('series');
        if (!manga) return res.status(404).json({ message: 'Manga not found' });
        res.json(serializeManga(manga));
    } catch (error: unknown) {
        console.error('Error fetching manga:', error);
        res.status(500).json({ message: 'Error fetching manga' });
    }
};

// Create manga
export const createManga = async (req: Request, res: Response) => {
    const mangaData = pickRequestFields<MangaInput>(req.body, mangaFields);
    if (!mangaData) {
        res.status(400).json({ message: 'A manga object is required' });
        return;
    }
    if (typeof mangaData.title !== 'string' || !mangaData.title.trim()
        || typeof mangaData.author !== 'string' || !mangaData.author.trim()
        || typeof mangaData.genre !== 'string' || !mangaData.genre.trim()
        || typeof mangaData.volume !== 'number' || typeof mangaData.price !== 'number'
        || typeof mangaData.rentalPrice !== 'number' || typeof mangaData.stock !== 'number') {
        res.status(400).json({ message: 'Title, author, genre, volume, prices and stock are required' });
        return;
    }

    try {
        const series = await resolveMangaSeries(mangaData as MangaInput);
        const manga = await Manga.create({
            series: series._id,
            volume: mangaData.volume,
            isbn: mangaData.isbn,
            coverImage: mangaData.coverImage,
            price: mangaData.price,
            rentalPrice: mangaData.rentalPrice,
            stock: mangaData.stock
        });
        await manga.populate('series');
        res.status(201).json(serializeManga(manga));
    } catch (error: unknown) {
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).json({ message: error.message });
            return;
        }
        console.error('Error creating manga:', error);
        res.status(500).json({ message: 'Error creating manga' });
    }
};

// Update manga
export const updateManga = async (req: Request, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).json({ message: 'Invalid manga id' });
        return;
    }

    const mangaData = pickRequestFields<MangaInput>(req.body, mangaFields);
    if (!mangaData) {
        res.status(400).json({ message: 'No supported manga fields were provided' });
        return;
    }

    try {
        const current = await Manga.findById(req.params.id).populate('series');
        if (!current) return res.status(404).json({ message: 'Manga not found' });
        const currentSeries = current.series as IMangaSeries;
        const seriesPatch = Object.fromEntries(seriesFieldNames
            .filter(field => mangaData[field] !== undefined)
            .map(field => [field, mangaData[field]]));
        let seriesId = currentSeries._id;
        if (Object.keys(seriesPatch).length) {
            if (seriesPatch.title !== undefined) {
                const seriesFields = { ...currentSeries.toObject(), ...seriesPatch } as Pick<MangaInput, 'title' | 'author' | 'genre'> & Partial<MangaInput>;
                const series = await resolveMangaSeries(seriesFields);
                seriesId = series._id;
            } else {
                const series = await MangaSeries.findByIdAndUpdate(currentSeries._id, { $set: seriesPatch }, { new: true, runValidators: true });
                if (!series) return res.status(409).json({ message: 'The manga series no longer exists' });
                seriesId = series._id;
            }
        }
        const volumePatch = Object.fromEntries(volumeFieldNames
            .filter(field => mangaData[field] !== undefined)
            .map(field => [field, mangaData[field]]));
        const update: Record<string, unknown> = { ...volumePatch };
        if (seriesId.toString() !== currentSeries._id.toString()) update.series = seriesId;
        const updatedManga = await Manga.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true }).populate('series');
        if (!updatedManga) return res.status(404).json({ message: 'Manga not found' });
        res.json(serializeManga(updatedManga));
    } catch (error: unknown) {
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).json({ message: error.message });
            return;
        }
        console.error('Error updating manga:', error);
        res.status(500).json({ message: 'Error updating manga' });
    }
};

// Delete manga
export const deleteManga = async (req: Request, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).json({ message: 'Invalid manga id' });
        return;
    }

    try {
        if (await Rental.exists({ manga: req.params.id })) {
            res.status(409).json({ message: 'Cannot delete a manga with rental history' });
            return;
        }

        const deletedManga = await Manga.findByIdAndDelete(req.params.id);
        if (!deletedManga) return res.status(404).json({ message: 'Manga not found' });
        res.json({ message: 'Manga deleted successfully' });
    } catch (error: unknown) {
        console.error('Error deleting manga:', error);
        res.status(500).json({ message: 'Error deleting manga' });
    }
};

// Search mangas (Basic text search)
export const searchMangas = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        if (!q) return getMangas(req, res);
        if (typeof q !== 'string' || q.trim().length > 200) {
            res.status(400).json({ message: 'Query parameter "q" must be a string of at most 200 characters' });
            return;
        }

        const series = await MangaSeries.find({ $text: { $search: q.trim() } }).select('_id');
        const mangas = await Manga.find({ series: { $in: series.map(item => item._id) } }).populate('series');
        res.json(serializeMangas(mangas));
    } catch (error: unknown) {
        console.error('Error searching mangas:', error);
        res.status(500).json({ message: 'Error searching mangas' });
    }
};

// Search remote mangas via Jikan API
export const searchRemoteMangas = async (req: Request, res: Response) => {
    const { q } = req.query;
    if (typeof q !== 'string' || !q.trim()) {
        return res.status(400).json({ message: 'Query parameter "q" is required' });
    }
    if (q.trim().length > 200) {
        return res.status(400).json({ message: 'Query parameter "q" must be at most 200 characters' });
    }

    const query = q.trim();
    try {
        const response = await axios.get<JikanSearchResponse>('https://api.jikan.moe/v4/manga', {
            params: { q: query, limit: 5 },
            timeout: 10_000
        });
        return res.json(response.data.data.map(normalizeJikanManga));
    } catch (jikanError: unknown) {
        const status = axios.isAxiosError(jikanError) ? jikanError.response?.status : undefined;
        console.warn(`Jikan search unavailable${status ? ` (HTTP ${status})` : ''}; trying MangaDex.`);
    }

    try {
        const response = await axios.get<MangaDexSearchResponse>('https://api.mangadex.org/manga', {
            params: {
                title: query,
                'includes[]': ['author', 'cover_art'],
                limit: 30
            },
            paramsSerializer: (params) => {
                const parts: string[] = [];
                for (const [key, value] of Object.entries(params)) {
                    if (Array.isArray(value)) {
                        value.forEach((item) => parts.push(`${key}=${encodeURIComponent(String(item))}`));
                    } else if (value !== undefined && value !== null) {
                        parts.push(`${key}=${encodeURIComponent(String(value))}`);
                    }
                }
                return parts.join('&');
            },
            timeout: 10_000,
            headers: { 'User-Agent': 'MEVN-CRM/1.0' }
        });

        const normalizeTitle = (title: string): string => title
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
        const normalizedQuery = normalizeTitle(query);
        const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
        const rankedResults = response.data.data
            .filter((item) => !item.attributes.tags?.some((tag) =>
                tag.attributes?.group === 'format'
                && Object.values(tag.attributes.name || {}).some((name) => name.toLowerCase() === 'doujinshi')
            ))
            .map((item, index) => {
                const titles = [item.attributes.title, ...(item.attributes.altTitles || [])]
                    .flatMap((title) => Object.values(title))
                    .map(normalizeTitle);
                const score = titles.reduce((best, title) => {
                    if (title === normalizedQuery) return Math.max(best, 1000);
                    if (title.startsWith(normalizedQuery)) return Math.max(best, 700);
                    const matchingWords = queryWords.filter((word) => title.includes(word)).length;
                    return Math.max(best, matchingWords * 20);
                }, 0);
                return { item, index, score };
            })
            .filter((result) => result.score > 0)
            .sort((left, right) => right.score - left.score || left.index - right.index)
            .slice(0, 10)
            .map(({ item }) => normalizeMangaDexManga(item));

        return res.json(rankedResults);
    } catch (mangaDexError: unknown) {
        const status = axios.isAxiosError(mangaDexError) ? mangaDexError.response?.status : undefined;
        console.error(`MangaDex fallback search failed${status ? ` (HTTP ${status})` : ''}.`);
        return res.status(503).json({ message: 'Manga search providers are temporarily unavailable. Please try again shortly.' });
    }
};

const volumeCoverCache = new Map<string, { volumes: AvailableMangaVolume[]; expiresAt: number }>();
const VOLUME_COVER_CACHE_MS = 10 * 60 * 1000;

const getMangaDexVolumeCovers = async (mangaDexId: string, originalLanguage = ''): Promise<AvailableMangaVolume[]> => {
    const cached = volumeCoverCache.get(mangaDexId);
    if (cached && cached.expiresAt > Date.now()) return cached.volumes;

    const limit = 100;
    const maxCovers = 500;
    let offset = 0;
    let total = 0;
    const covers: MangaDexCover[] = [];

    do {
        const response = await axios.get<MangaDexCoverResponse>('https://api.mangadex.org/cover', {
            params: {
                'manga[]': [mangaDexId],
                limit,
                offset,
                'order[volume]': 'asc'
            },
            paramsSerializer: (params) => {
                const parts: string[] = [];
                for (const [key, value] of Object.entries(params)) {
                    if (Array.isArray(value)) {
                        value.forEach((item) => parts.push(`${key}=${encodeURIComponent(String(item))}`));
                    } else if (value !== undefined && value !== null) {
                        parts.push(`${key}=${encodeURIComponent(String(value))}`);
                    }
                }
                return parts.join('&');
            },
            timeout: 10_000,
            headers: { 'User-Agent': 'MEVN-CRM/1.0' }
        });

        covers.push(...response.data.data);
        total = response.data.total;
        if (response.data.data.length === 0) break;
        offset += response.data.data.length;
    } while (offset < total && offset < maxCovers && offset > 0);

    const preferredLocales = ['es', 'es-la', 'en', originalLanguage].filter(Boolean);
    const byVolume = new Map<number, AvailableMangaVolume>();
    for (const cover of covers) {
        const rawVolume = cover.attributes.volume;
        if (!rawVolume || !/^\d+(?:\.\d+)?$/.test(rawVolume)) continue;

        const volume = Number(rawVolume);
        if (!Number.isFinite(volume) || volume < 1 || !cover.attributes.fileName) continue;

        const candidate: AvailableMangaVolume = {
            volume,
            coverImage: `https://uploads.mangadex.org/covers/${mangaDexId}/${cover.attributes.fileName}`,
            locale: cover.attributes.locale
        };
        const current = byVolume.get(volume);
        const candidateRank = preferredLocales.indexOf(candidate.locale);
        const currentRank = current ? preferredLocales.indexOf(current.locale) : Number.POSITIVE_INFINITY;
        if (!current || (candidateRank >= 0 && candidateRank < (currentRank < 0 ? Number.POSITIVE_INFINITY : currentRank))) {
            byVolume.set(volume, candidate);
        }
    }

    const volumes = [...byVolume.values()].sort((left, right) => left.volume - right.volume);
    volumeCoverCache.set(mangaDexId, { volumes, expiresAt: Date.now() + VOLUME_COVER_CACHE_MS });
    return volumes;
};

export const getMangaDexVolumes = async (req: Request, res: Response) => {
    const { mangaDexId, title, author, malId } = req.query;
    if (mangaDexId !== undefined && (typeof mangaDexId !== 'string' || !/^[\da-f-]{36}$/i.test(mangaDexId))) {
        return res.status(400).json({ message: 'Invalid MangaDex series id' });
    }
    if (!mangaDexId && (typeof title !== 'string' || !title.trim() || title.length > 200)) {
        return res.status(400).json({ message: 'A title or MangaDex series id is required' });
    }
    if (author !== undefined && (typeof author !== 'string' || author.length > 200)) {
        return res.status(400).json({ message: 'Author must be a string of at most 200 characters' });
    }
    if (malId !== undefined && (typeof malId !== 'string' || !/^\d{1,12}$/.test(malId))) {
        return res.status(400).json({ message: 'Invalid MyAnimeList id' });
    }

    try {
        let series: MangaDexSearchResult;
        if (typeof mangaDexId === 'string') {
            const response = await axios.get<MangaDexSingleResponse>(`https://api.mangadex.org/manga/${mangaDexId}`, {
                params: { 'includes[]': ['author'] },
                timeout: 10_000,
                headers: { 'User-Agent': 'MEVN-CRM/1.0' }
            });
            series = response.data.data;
        } else {
            const response = await axios.get<MangaDexSearchResponse>('https://api.mangadex.org/manga', {
                params: {
                    title: String(title).trim(),
                    'includes[]': ['author', 'cover_art'],
                    limit: 50
                },
                paramsSerializer: (params) => {
                    const parts: string[] = [];
                    for (const [key, value] of Object.entries(params)) {
                        if (Array.isArray(value)) {
                            value.forEach((item) => parts.push(`${key}=${encodeURIComponent(String(item))}`));
                        } else if (value !== undefined && value !== null) {
                            parts.push(`${key}=${encodeURIComponent(String(value))}`);
                        }
                    }
                    return parts.join('&');
                },
                timeout: 10_000,
                headers: { 'User-Agent': 'MEVN-CRM/1.0' }
            });

            const candidates = response.data.data;
            const malMatch = typeof malId === 'string'
                ? candidates.find((candidate) => candidate.attributes.links?.mal === malId)
                : undefined;
            const titleMatch = candidates.length > 0
                ? findBestTitleMatch(candidates, String(title), typeof author === 'string' ? author : undefined)
                : undefined;
            const selected = malMatch || titleMatch;
            if (!selected) return res.status(404).json({ message: 'Could not find matching manga series in MangaDex' });
            series = selected;
        }

        const volumes = await getMangaDexVolumeCovers(series.id, series.attributes.originalLanguage);
        const getLocalizedText = (values: Record<string, string> | undefined): string =>
            values?.en || values?.['en-us'] || values?.['ja-ro'] || values?.ja || (values ? Object.values(values)[0] : '') || '';
        const seriesTitle = getLocalizedText(series.attributes.title);
        const seriesAuthor = series.relationships
            .filter((relationship) => relationship.type === 'author' || relationship.type === 'artist')
            .map((relationship) => relationship.attributes?.name)
            .filter((name): name is string => Boolean(name))
            .join(', ');

        return res.json({
            mangaDexId: series.id,
            title: seriesTitle,
            author: seriesAuthor,
            volumes
        });
    } catch (error: unknown) {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        if (status === 404) return res.status(404).json({ message: 'Manga series not found in MangaDex' });
        console.error(`MangaDex volume lookup failed${status ? ` (HTTP ${status})` : ''}.`);
        return res.status(503).json({ message: 'Volume information is temporarily unavailable. Please try again shortly.' });
    }
};

// Fetch MangaDex cover - VERSIÓN MEJORADA
export const fetchMangaDexCover = async (req: Request, res: Response) => {
    try {
        const { title, volume, author, malId, mangaDexId } = req.query;
        if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ message: 'Title is required' });
        if (mangaDexId !== undefined && (typeof mangaDexId !== 'string' || !/^[\da-f-]{36}$/i.test(mangaDexId))) {
            return res.status(400).json({ message: 'Invalid MangaDex series id' });
        }

        console.log('='.repeat(60));
        console.log(`[COVER SEARCH] Title: "${title}"`);
        console.log(`[COVER SEARCH] Author: "${author || 'Not provided'}"`);
        console.log(`[COVER SEARCH] Volume: ${volume || '1'}`);
        console.log(`[COVER SEARCH] MAL ID: ${malId || 'Not provided'}`);

        const targetVolume = String(volume || '1');
        if (!/^\d+(?:\.\d+)?$/.test(targetVolume) || Number(targetVolume) < 1) {
            return res.status(400).json({ message: 'Volume must be a positive number' });
        }
        let selectedManga: any = null;

        if (typeof mangaDexId === 'string') {
            selectedManga = {
                id: mangaDexId,
                attributes: { title: { en: title }, links: {}, originalLanguage: '' },
                relationships: []
            };
        }

        // Cliente Axios específico para MangaDex con serializer correcto
        const mangaDexClient = axios.create({
            baseURL: 'https://api.mangadex.org',
            headers: { 'User-Agent': 'MEVN-CRM/1.0' },
            paramsSerializer: (params) => {
                const parts: string[] = [];
                for (const key in params) {
                    const val = params[key];
                    if (Array.isArray(val)) {
                        val.forEach((v: any) => parts.push(`${key}=${encodeURIComponent(v)}`));
                    } else {
                        parts.push(`${key}=${encodeURIComponent(val)}`);
                    }
                }
                return parts.join('&');
            }
        });

        // STRATEGY 1: Búsqueda directa por MAL ID (MÁS CONFIABLE)
        if (malId) {
            console.log(`[Strategy 1] Searching by MAL ID: ${malId}`);

            try {
                // Initial search with full title
                let searchRes = await mangaDexClient.get('/manga', {
                    params: {
                        title: title,
                        'includes[]': ['cover_art', 'author'],
                        'contentRating[]': ['safe', 'suggestive', 'erotica'],
                        limit: 50
                    }
                });


                // Fallback Removed: "Magi" short search proved to return garbage results.
                // Relying on Full Title search or Author Search (Strategy 2).

                // Filtrar por MAL ID exacto
                const malMatches = searchRes.data.data.filter((manga: any) => {
                    const links = manga.attributes.links || {};
                    return links.mal && String(links.mal) === String(malId);
                });

                if (malMatches.length > 0) {
                    selectedManga = malMatches[0];
                    console.log(`[Strategy 1] ✓ Found exact MAL match: ${Object.values(selectedManga.attributes.title)[0]}`);
                } else {
                    console.log(`[Strategy 1] ⚠ No exact MAL match found (checked ${searchRes.data.data.length} results). Trying fallback...`);
                }
            } catch (err: any) {
                console.warn('[Strategy 1] MAL search failed:', err.message);
            }
        }

        // STRATEGY 2: Búsqueda por Autor + Título (SEGUNDA OPCIÓN)
        if (!selectedManga && author) {
            console.log(`[Strategy 2] Searching by Author + Title`);

            try {
                // Buscar autor primero
                const authorRes = await mangaDexClient.get('/author', {
                    params: { name: author, limit: 10 }
                });

                const authorMatch = authorRes.data.data.find((a: any) => {
                    const authorName = a.attributes.name.toLowerCase();
                    const searchAuthor = (author as string).toLowerCase();

                    const authorNameParts = authorName.split(/[\s,]+/);
                    const searchParts = searchAuthor.split(/[\s,]+/);

                    return searchParts.every((part: string) => authorName.includes(part)) ||
                        authorNameParts.every((part: string) => searchAuthor.includes(part));
                });

                if (authorMatch) {
                    console.log(`[Strategy 2] Found author: ${authorMatch.attributes.name}`);

                    // Buscar manga por autor + título
                    const mangaRes = await mangaDexClient.get('/manga', {
                        params: {
                            title: title,
                            'authors[]': [authorMatch.id],
                            'includes[]': ['cover_art', 'author'],
                            'contentRating[]': ['safe', 'suggestive', 'erotica'],
                            limit: 10
                        }
                    });

                    if (mangaRes.data.data.length > 0) {
                        // Tomar el mejor match por similitud de título
                        selectedManga = findBestTitleMatch(mangaRes.data.data, title as string);
                        if (selectedManga) {
                            console.log(`[Strategy 2] ✓ Found by author: ${Object.values(selectedManga.attributes.title)[0]}`);
                        }
                    }
                }
            } catch (err: any) {
                console.warn('[Strategy 2] Author search failed:', err.message);
            }
        }

        // STRATEGY 3: Búsqueda solo por título (FALLBACK)
        if (!selectedManga) {
            console.log(`[Strategy 3] Searching by title only`);

            const searchRes = await mangaDexClient.get('/manga', {
                params: {
                    title: title,
                    'includes[]': ['cover_art', 'author'],
                    'contentRating[]': ['safe', 'suggestive', 'erotica'],
                    limit: 30
                }
            });

            if (searchRes.data.data.length > 0) {
                // Encontrar el mejor match
                selectedManga = findBestTitleMatch(searchRes.data.data, title as string, author as string);
                if (selectedManga) {
                    console.log(`[Strategy 3] Selected: ${Object.values(selectedManga.attributes.title)[0]}`);
                } else {
                    console.log(`[Strategy 3] No match passed the score threshold.`);
                }
            }
        }

        if (!selectedManga) {
            return res.status(404).json({ message: 'Could not find matching manga' });
        }

        // Log del manga seleccionado
        const selectedTitle = Object.values(selectedManga.attributes.title)[0] as string;
        const selectedAuthor = selectedManga.relationships.find((r: any) => r.type === 'author')?.attributes?.name || author || 'Unknown';
        const selectedMalId = selectedManga.attributes.links?.mal || malId || 'N/A';
        console.log(`\n[SELECTED MANGA]`);
        console.log(`  Title: ${selectedTitle}`);
        console.log(`  Author: ${selectedAuthor}`);
        console.log(`  MAL ID: ${selectedMalId}`);
        console.log(`  MangaDex ID: ${selectedManga.id}`);

        // Buscar el cover del volumen específico
        const cover = (await getMangaDexVolumeCovers(selectedManga.id, selectedManga.attributes.originalLanguage || ''))
            .find((availableVolume) => availableVolume.volume === Number(targetVolume));

        if (!cover) {
            console.warn(`[WARN] Cover for Volume ${targetVolume} not found. Returning without cover.`);
            // Return success even if cover is missing, to allow adding the manga
            return res.json({
                imageUrl: null,
                message: 'Manga found but cover not available for this volume',
                manga: {
                    title: selectedTitle,
                    author: selectedAuthor,
                    malId: selectedMalId
                },
                mangaFound: selectedTitle,
                debug: { mangaId: selectedManga.id, targetVolume }
            });
        }

        const imageUrl = cover.coverImage;

        console.log(`\n[SUCCESS] Cover URL: ${imageUrl}\n`);
        res.json({
            imageUrl,
            manga: {
                title: selectedTitle,
                author: selectedAuthor,
                malId: selectedMalId
            }
        });

    } catch (error: any) {
        console.error('MangaDex API Error:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
            res.status(error.response.status).json({
                message: 'MangaDex API Error',
                details: error.response.data
            });
        } else {
            res.status(500).json({
                message: 'Error fetching data from MangaDex',
                error: error.message
            });
        }
    }
};

// Helper: Encuentra el mejor match de título
function findBestTitleMatch(mangas: any[], queryTitle: string, queryAuthor?: string): any {
    const normalizeTitle = (str: string) => str.toLowerCase().trim()
        .replace(/[:\-–—]/g, ' ')
        .replace(/\s+/g, ' ');

    const queryNormalized = normalizeTitle(queryTitle);
    const queryWords = queryNormalized.split(' ').filter(w => w.length > 2);

    // Calcular score para cada manga
    const scored = mangas.map((manga: any) => {
        let score = 0;

        // Obtener todos los títulos del manga
        const allTitles = [
            ...Object.values(manga.attributes.title),
            ...(manga.attributes.altTitles || []).flatMap((t: any) => Object.values(t))
        ].map((t: any) => normalizeTitle(t || ''));

        // 1. Match exacto (100 puntos)
        if (allTitles.some(t => t === queryNormalized)) {
            score += 100;
        }

        // 2. Match de todas las palabras clave (50 puntos)
        const hasAllWords = allTitles.some(t =>
            queryWords.every(word => t.includes(word))
        );
        if (hasAllWords) score += 50;

        // 3. Match de la primera palabra importante (30 puntos)
        const mainKeyword = queryWords[0];
        if (allTitles.some(t => t.startsWith(mainKeyword))) {
            score += 30;
        }

        // 4. Contiene la primera palabra (10 puntos)
        if (allTitles.some(t => t.includes(mainKeyword))) {
            score += 10;
        }

        // 5. Bonus por autor (20 puntos)
        if (queryAuthor) {
            const mangaAuthor = manga.relationships
                .find((r: any) => r.type === 'author')?.attributes?.name?.toLowerCase() || '';
            const authorMatch = mangaAuthor.includes(queryAuthor.toLowerCase()) ||
                queryAuthor.toLowerCase().includes(mangaAuthor);
            if (authorMatch) score += 20;
        }

        return { manga, score, title: allTitles[0] };
    });

    // Ordenar por score descendente
    scored.sort((a, b) => b.score - a.score);

    // Log de los top 3 para debug
    console.log('\n[RANKING] Top matches:');
    scored.slice(0, 3).forEach((item, i) => {
        const author = item.manga.relationships
            .find((r: any) => r.type === 'author')?.attributes?.name || 'Unknown';
        console.log(`  ${i + 1}. [Score: ${item.score}] "${Object.values(item.manga.attributes.title)[0]}" by ${author}`);
    });

    // Validar el mejor score
    const bestMatch = scored[0];
    if (bestMatch.score < 50) {
        console.warn(`[WARN] Best match score (${bestMatch.score}) is too low. Rejecting match.`);
        return null;
    }

    return bestMatch.manga;
}
