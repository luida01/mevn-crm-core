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
        const mangas = response.data.data.map((item: any) => ({
            title: item.title,
            author: item.authors[0]?.name || 'Unknown',
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
        }));

        res.json(mangas);
    } catch (error: any) {
        console.error('Jikan API Error:', error.message);
        res.status(500).json({ message: 'Error fetching data from Jikan API' });
    }
};

// Fetch MangaDex cover
export const fetchMangaDexCover = async (req: Request, res: Response) => {
    try {
        const { title, volume, author } = req.query;
        if (!title) return res.status(400).json({ message: 'Title is required' });

        console.log(`Searching MangaDex for title: "${title}" (Author: "${author || 'Any'}")`);

        let searchResults: any[] = [];

        // Strategy 1: If author is provided, try to find author ID first
        if (author) {
            try {
                console.log(`Attempting Author-First Search for: ${author}`);
                const authorRes = await axios.get(`https://api.mangadex.org/author`, {
                    params: { name: author, limit: 5 }
                });

                // Find best author match
                const targetAuthor = authorRes.data.data.find((a: any) =>
                    a.attributes.name.toLowerCase().includes((author as string).toLowerCase())
                );

                if (targetAuthor) {
                    console.log(`Found Author: ${targetAuthor.attributes.name} (ID: ${targetAuthor.id})`);

                    // Search manga by Author ID and Title
                    const mangaRes = await axios.get(`https://api.mangadex.org/manga`, {
                        params: {
                            title: title,
                            'authors[]': [targetAuthor.id],
                            limit: 5,
                            'contentRating[]': ['safe', 'suggestive', 'erotica'],
                            'includes[]': ['author']
                        }
                    });

                    if (mangaRes.data.data.length > 0) {
                        console.log(`Found ${mangaRes.data.data.length} mangas by author.`);
                        searchResults = mangaRes.data.data;
                    }
                }
            } catch (err) {
                console.warn("Author search failed, falling back to title search:", err);
            }
        }

        // Strategy 2: Fallback to Title Search if no results yet
        if (searchResults.length === 0) {
            console.log("Falling back to Title Search...");
            const searchRes = await axios.get(`https://api.mangadex.org/manga`, {
                params: {
                    title: title,
                    limit: 20,
                    'contentRating[]': ['safe', 'suggestive', 'erotica'],
                    'includes[]': ['author']
                },
                headers: {
                    'User-Agent': 'MEVN-CRM/1.0',
                    'Accept-Encoding': 'identity'
                }
            });
            searchResults = searchRes.data.data;
        }

        if (!searchResults || searchResults.length === 0) {
            return res.status(404).json({ message: 'Manga not found on MangaDex' });
        }

        // Helper to fetch all covers with pagination
        const fetchAllCovers = async (mangaId: string, locales: string[] | null) => {
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
                if (locales) {
                    params['locales[]'] = locales;
                }

                const res = await axios.get(`https://api.mangadex.org/cover`, {
                    params: params,
                    headers: {
                        'User-Agent': 'MEVN-CRM/1.0',
                        'Accept-Encoding': 'identity'
                    }
                });

                const data = res.data.data;
                total = res.data.total;
                allCovers = allCovers.concat(data);
                offset += limit;

            } while (offset < total);

            return allCovers;
        };

        const findCoverInList = (covers: any[], vol: string) => {
            return covers.find((c: any) => c.attributes.volume === vol || parseFloat(c.attributes.volume) === parseFloat(vol));
        };

        const targetVolume = String(volume || '1');
        let foundCover = null;
        let selectedManga = null;

        // Sort candidates by relevance: Exact Title Match > Author Match > Others
        const sortedCandidates = searchResults.sort((a: any, b: any) => {
            const titleA = Object.values(a.attributes.title)[0] as string;
            const titleB = Object.values(b.attributes.title)[0] as string;
            const queryTitle = title as string;

            const exactMatchA = titleA.toLowerCase() === queryTitle.toLowerCase();
            const exactMatchB = titleB.toLowerCase() === queryTitle.toLowerCase();

            if (exactMatchA && !exactMatchB) return -1;
            if (!exactMatchA && exactMatchB) return 1;

            if (author) {
                const authorName = author as string;
                const authorA = a.relationships.find((r: any) => r.type === 'author')?.attributes?.name || '';
                const authorB = b.relationships.find((r: any) => r.type === 'author')?.attributes?.name || '';

                // Simple fuzzy check
                const matchA = authorA.toLowerCase().includes(authorName.toLowerCase());
                const matchB = authorB.toLowerCase().includes(authorName.toLowerCase());

                if (matchA && !matchB) return -1;
                if (!matchA && matchB) return 1;
            }

            return 0;
        });

        // Iterate through sorted results
        for (const manga of sortedCandidates) {
            const mangaId = manga.id;
            const originalLanguage = manga.attributes.originalLanguage;
            const mangaTitle = Object.values(manga.attributes.title)[0] as string;
            const mangaAuthor = manga.relationships.find((r: any) => r.type === 'author')?.attributes?.name || 'Unknown';

            console.log(`Checking candidate: "${mangaTitle}" by ${mangaAuthor} (ID: ${mangaId})`);

            // If author is provided, skip if it doesn't match at all (optional strictness)
            if (author && !mangaAuthor.toLowerCase().includes((author as string).toLowerCase()) && !mangaTitle.toLowerCase().includes((title as string).toLowerCase())) {
                // If neither title nor author matches well, maybe skip? 
                // For now, let's just prioritize via sort and still check covers.
            }

            // Attempt 1: Original Language
            let covers = await fetchAllCovers(mangaId, [originalLanguage]);
            let cover = findCoverInList(covers, targetVolume);

            // Attempt 2: Fallback to English
            if (!cover) {
                covers = await fetchAllCovers(mangaId, ['en']);
                cover = findCoverInList(covers, targetVolume);
            }

            // Attempt 3: Any language
            if (!cover) {
                covers = await fetchAllCovers(mangaId, null);
                cover = findCoverInList(covers, targetVolume);
            }

            if (cover) {
                foundCover = cover;
                selectedManga = manga;
                console.log(`Found volume ${targetVolume} in candidate: ${mangaTitle}`);
                break; // Stop searching if found
            }
        }

        if (!foundCover) {
            console.log(`Cover for volume ${targetVolume} not found in any candidate.`);
            return res.status(404).json({
                message: `Cover for volume ${targetVolume} not found.`,
                debug: {
                    targetVolume,
                    candidatesChecked: searchResults.length
                }
            });
        }

        const fileName = foundCover.attributes.fileName;
        const imageUrl = `https://uploads.mangadex.org/covers/${selectedManga.id}/${fileName}`;

        console.log(`Found cover: ${imageUrl}`);
        res.json({ imageUrl });
    } catch (error: any) {
        console.error('MangaDex API Error:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
            res.status(error.response.status).json({
                message: 'MangaDex API Error',
                details: error.response.data,
                config: {
                    url: error.config.url,
                    headers: error.config.headers,
                    params: error.config.params
                }
            });
        } else {
            res.status(500).json({ message: 'Error fetching data from MangaDex', error: error.message });
        }
    }
};
