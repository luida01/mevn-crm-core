import { Request, Response } from 'express';
import Manga from '../models/Manga';
import axios from 'axios';

// Get all mangas
export const getMangas = async (req: Request, res: Response) => {
    try {
        const mangas = await Manga.find().sort({ createdAt: -1 });
        res.json(mangas);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get single manga
export const getManga = async (req: Request, res: Response) => {
    try {
        const manga = await Manga.findById(req.params.id);
        if (!manga) return res.status(404).json({ message: 'Manga not found' });
        res.json(manga);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Create manga
export const createManga = async (req: Request, res: Response) => {
    try {
        const newManga = new Manga(req.body);
        const savedManga = await newManga.save();
        res.status(201).json(savedManga);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// Update manga
export const updateManga = async (req: Request, res: Response) => {
    try {
        const updatedManga = await Manga.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedManga) return res.status(404).json({ message: 'Manga not found' });
        res.json(updatedManga);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// Delete manga
export const deleteManga = async (req: Request, res: Response) => {
    try {
        const deletedManga = await Manga.findByIdAndDelete(req.params.id);
        if (!deletedManga) return res.status(404).json({ message: 'Manga not found' });
        res.json({ message: 'Manga deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Search mangas (Basic text search)
export const searchMangas = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        if (!q) return getMangas(req, res);

        const mangas = await Manga.find({
            $text: { $search: q as string }
        });
        res.json(mangas);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Search remote mangas via Jikan API
export const searchRemoteMangas = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Query parameter "q" is required' });

        const response = await axios.get(`https://api.jikan.moe/v4/manga?q=${q}&limit=5`);

        // Transform Jikan data to our format
        const mangas = response.data.data.map((item: any) => {
            // Use the longer title (prefer title_english if available, else title)
            // Also try: title_japanese, title_synonyms
            const fullTitle = item.title_english || item.title;

            // Convert author from "LastName, FirstName" to "FirstName LastName"
            let authorName = item.authors[0]?.name || 'Unknown';
            if (authorName.includes(', ')) {
                const parts = authorName.split(', ');
                authorName = `${parts[1]} ${parts[0]}`; // "Ohtaka, Shinobu" -> "Shinobu Ohtaka"
            }

            return {
                title: fullTitle,
                author: authorName,
                genre: item.genres.map((g: any) => g.name).join(', ') || 'Unknown',
                description: item.synopsis,
                coverImage: item.images.jpg.image_url,
                publishedYear: item.published.from ? new Date(item.published.from).getFullYear() : null,
                status: item.status || 'Unknown', // Publication status
                malScore: item.score || null, // MAL score
                malId: item.mal_id ? String(item.mal_id) : null, // MAL ID
                price: 0, // Default
                rentalPrice: 0, // Default
                stock: 0 // Default
            };
        });

        res.json(mangas);
    } catch (error: any) {
        console.error('Jikan API Error:', error.message);
        res.status(500).json({ message: 'Error fetching data from Jikan API' });
    }
};

// Fetch MangaDex cover - VERSIÓN MEJORADA
export const fetchMangaDexCover = async (req: Request, res: Response) => {
    try {
        const { title, volume, author, malId } = req.query;
        if (!title) return res.status(400).json({ message: 'Title is required' });

        console.log('='.repeat(60));
        console.log(`[COVER SEARCH] Title: "${title}"`);
        console.log(`[COVER SEARCH] Author: "${author || 'Not provided'}"`);
        console.log(`[COVER SEARCH] Volume: ${volume || '1'}`);
        console.log(`[COVER SEARCH] MAL ID: ${malId || 'Not provided'}`);

        const targetVolume = String(volume || '1');
        let selectedManga: any = null;

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
        const selectedAuthor = selectedManga.relationships.find((r: any) => r.type === 'author')?.attributes?.name || 'Unknown';
        const selectedMalId = selectedManga.attributes.links?.mal || 'N/A';
        console.log(`\n[SELECTED MANGA]`);
        console.log(`  Title: ${selectedTitle}`);
        console.log(`  Author: ${selectedAuthor}`);
        console.log(`  MAL ID: ${selectedMalId}`);
        console.log(`  MangaDex ID: ${selectedManga.id}`);

        // Buscar el cover del volumen específico
        const cover = await findVolumeCover(selectedManga.id, targetVolume, selectedManga.attributes.originalLanguage);

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

        const fileName = cover.attributes.fileName;
        const imageUrl = `https://uploads.mangadex.org/covers/${selectedManga.id}/${fileName}`;

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

// Helper: Busca el cover de un volumen específico
async function findVolumeCover(mangaId: string, targetVolume: string, originalLanguage: string): Promise<any> {
    console.log(`\n[COVER SEARCH] Looking for volume ${targetVolume}...`);

    // Helper para buscar por locale
    const searchByLocale = async (locales: string[] | null) => {
        let allCovers: any[] = [];
        let offset = 0;
        const limit = 100;
        let total = 0;

        do {
            const params: any = {
                'manga[]': [mangaId],
                limit: limit,
                offset: offset,
                'order[volume]': 'asc'
            };
            if (locales) params['locales[]'] = locales;

            const res = await axios.get(`https://api.mangadex.org/cover`, {
                params: params,
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

            allCovers = allCovers.concat(res.data.data);
            total = res.data.total;
            offset += limit;

        } while (offset < total);

        return allCovers.find((c: any) =>
            c.attributes.volume === targetVolume ||
            parseFloat(c.attributes.volume) === parseFloat(targetVolume)
        );
    };

    // Intentar en orden de prioridad
    const strategies = [
        { name: 'English', locales: ['en'] },
        { name: 'Spanish', locales: ['es', 'es-la'] },
        { name: 'Original Language', locales: [originalLanguage] },
        { name: 'Any Language', locales: null }
    ];

    for (const strategy of strategies) {
        console.log(`  Trying ${strategy.name}...`);
        const cover = await searchByLocale(strategy.locales);
        if (cover) {
            console.log(`  ✓ Found in ${strategy.name}`);
            return cover;
        }
    }

    console.log(`  ✗ Volume ${targetVolume} not found in any language`);
    return null;
}
