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
        const { title, volume } = req.query;
        if (!title) return res.status(400).json({ message: 'Title is required' });

        console.log(`Searching MangaDex for title: ${title}`);
        // 1. Search Manga ID by Title (Fetch more to find exact match)
        const searchRes = await axios.get(`https://api.mangadex.org/manga`, {
            params: {
                title: title,
                limit: 5,
                contentRating: ['safe', 'suggestive', 'erotica'], // Exclude pornography
                order: { relevance: 'desc' }
            }
        });

        const searchResults = searchRes.data.data;

        if (!searchResults || searchResults.length === 0) {
            console.log('Manga not found');
            return res.status(404).json({ message: 'Manga not found on MangaDex' });
        }

        // Find exact match (case-insensitive)
        let manga = searchResults.find((m: any) => {
            const titles = Object.values(m.attributes.title).map((t: any) => t.toLowerCase());
            return titles.includes((title as string).toLowerCase());
        });

        // Fallback to first result if no exact match
        if (!manga) {
            console.log('No exact match found, using first result');
            manga = searchResults[0];
        }

        console.log(`Selected Manga: ${Object.values(manga.attributes.title)[0]} (ID: ${manga.id})`);

        const mangaId = manga.id;
        const targetVolume = String(volume || '1');
        console.log(`Found Manga ID: ${mangaId}, looking for volume: ${targetVolume}`);


        // 2. Search Cover Art
        const coverRes = await axios.get(`https://api.mangadex.org/cover`, {
            params: {
                manga: [mangaId],
                limit: 100,
            }
        });

        const covers = coverRes.data.data;

        // Find cover for specific volume
        let cover = covers.find((c: any) => c.attributes.volume === targetVolume);

        // Fallback: Try volume 1 if target not found
        if (!cover && targetVolume !== '1') {
            cover = covers.find((c: any) => c.attributes.volume === '1');
        }

        // Fallback: Take the first one if still nothing
        if (!cover && covers.length > 0) {
            cover = covers[0];
        }

        if (!cover) {
            return res.status(404).json({ message: 'Cover not found' });
        }

        const fileName = cover.attributes.fileName;
        const imageUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;

        res.json({ imageUrl });
    } catch (error: any) {
        console.error('MangaDex API Error:', error.message);
        res.status(500).json({ message: 'Error fetching data from MangaDex' });
    }
};
