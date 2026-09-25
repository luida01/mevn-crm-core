import { Request, Response } from 'express';
import Manga from '../models/Manga';
import Rental from '../models/Rental';
import { escapeRegex, parseLimit } from '../utils/requestBody';
import axios from 'axios';

// Cache for MAL API responses (5 minutes)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key: string) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
};

const setCachedData = (key: string, data: any) => {
    cache.set(key, { data, timestamp: Date.now() });
};

// Get top-rated mangas (by MAL score >= 7.5, in stock)
export const getTopRatedMangas = async (req: Request, res: Response) => {
    try {
        const limit = parseLimit(req.query.limit, 10);

        // Try to get mangas with score >= 7.5
        let mangas = await Manga.find({
            malScore: { $gte: 7.5 },
            stock: { $gt: 0 }
        })
            .sort({ malScore: -1 })
            .limit(limit);

        // Fallback: if no mangas with score, get any mangas in stock
        if (mangas.length === 0) {
            mangas = await Manga.find({ stock: { $gt: 0 } })
                .sort({ createdAt: -1 })
                .limit(limit);
        }

        res.json(mangas);
    } catch (error: unknown) {
        console.error('Error fetching top-rated mangas:', error);
        res.status(500).json({ message: 'Error fetching top-rated mangas' });
    }
};

// Get recent arrivals (last 30 days, in stock)
export const getRecentArrivals = async (req: Request, res: Response) => {
    try {
        const limit = parseLimit(req.query.limit, 12);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const mangas = await Manga.find({
            createdAt: { $gte: thirtyDaysAgo },
            stock: { $gt: 0 }
        })
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json(mangas);
    } catch (error: unknown) {
        console.error('Error fetching recent arrivals:', error);
        res.status(500).json({ message: 'Error fetching recent arrivals' });
    }
};

// Get thematic collections
export const getThematicCollections = async (req: Request, res: Response) => {
    try {
        const { theme } = req.params;
        const cacheKey = `collection_${theme}`;

        // Check cache first
        const cached = getCachedData(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        let genreFilter: string[] = [];
        let statusFilter: string | null = null;
        let scoreFilter: number | null = null;

        // Define theme filters
        switch (theme) {
            case 'beginner':
                genreFilter = ['Action', 'Adventure', 'Shounen'];
                scoreFilter = 7.5;
                break;
            case 'anime-adaptations':
                statusFilter = 'Publishing';
                scoreFilter = 7.0;
                break;
            case 'horror':
                genreFilter = ['Horror', 'Psychological', 'Thriller'];
                break;
            default:
                return res.status(400).json({ message: 'Invalid theme' });
        }

        // Build query
        const query: any = { stock: { $gt: 0 } };

        if (genreFilter.length > 0) {
            query.genre = { $regex: genreFilter.join('|'), $options: 'i' };
        }
        if (statusFilter) {
            query.status = statusFilter;
        }
        if (scoreFilter) {
            query.malScore = { $gte: scoreFilter };
        }

        const mangas = await Manga.find(query)
            .sort({ malScore: -1 })
            .limit(12);

        // Cache the result
        setCachedData(cacheKey, mangas);

        res.json(mangas);
    } catch (error: unknown) {
        console.error('Error fetching thematic collection:', error);
        res.status(500).json({ message: 'Error fetching thematic collection' });
    }
};

// Get mangas by author
export const getMangasByAuthor = async (req: Request, res: Response) => {
    try {
        const { author } = req.params;
        const limit = parseLimit(req.query.limit, 12);
        if (author.length > 100) {
            return res.status(400).json({ message: 'Author name must be at most 100 characters' });
        }

        const mangas = await Manga.find({
            author: { $regex: escapeRegex(author), $options: 'i' },
            stock: { $gt: 0 }
        })
            .sort({ malScore: -1 })
            .limit(limit);

        res.json(mangas);
    } catch (error: unknown) {
        console.error('Error fetching mangas by author:', error);
        res.status(500).json({ message: 'Error fetching mangas by author' });
    }
};

// Get top authors
export const getTopAuthors = async (req: Request, res: Response) => {
    try {
        const limit = parseLimit(req.query.limit, 6);

        // Aggregate to get top authors by manga count
        const authors = await Manga.aggregate([
            { $match: { stock: { $gt: 0 } } },
            { $group: { _id: '$author', count: { $sum: 1 }, avgScore: { $avg: '$malScore' } } },
            { $sort: { count: -1 } },
            { $limit: limit }
        ]);

        res.json(authors);
    } catch (error: unknown) {
        console.error('Error fetching top authors:', error);
        res.status(500).json({ message: 'Error fetching top authors' });
    }
};

// Weekly rentals are the current available proxy for the shop's "most read" ranking.
export const getMostReadThisWeek = async (req: Request, res: Response) => {
    try {
        const limit = parseLimit(req.query.limit, 10);
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const mangas = await Rental.aggregate([
            { $match: { startDate: { $gte: since } } },
            { $group: { _id: '$manga', weeklyRentals: { $sum: 1 } } },
            { $sort: { weeklyRentals: -1, _id: 1 } },
            { $limit: limit },
            { $lookup: { from: Manga.collection.name, localField: '_id', foreignField: '_id', as: 'manga' } },
            { $unwind: '$manga' },
            { $replaceRoot: { newRoot: { $mergeObjects: ['$manga', { weeklyRentals: '$weeklyRentals' }] } } }
        ]);

        res.json(mangas);
    } catch (error: unknown) {
        console.error('Error fetching weekly rental ranking:', error);
        res.status(500).json({ message: 'Error fetching most read' });
    }
};

// Get manga with the most rentals since the current UTC day began.
export const getMostRentedToday = async (req: Request, res: Response) => {
    try {
        const limit = parseLimit(req.query.limit, 10);
        const since = new Date();
        since.setUTCHours(0, 0, 0, 0);
        const mangas = await Rental.aggregate([
            { $match: { startDate: { $gte: since } } },
            { $group: { _id: '$manga', todayRentals: { $sum: 1 } } },
            { $sort: { todayRentals: -1, _id: 1 } },
            { $limit: limit },
            { $lookup: { from: Manga.collection.name, localField: '_id', foreignField: '_id', as: 'manga' } },
            { $unwind: '$manga' },
            { $replaceRoot: { newRoot: { $mergeObjects: ['$manga', { todayRentals: '$todayRentals' }] } } }
        ]);

        res.json(mangas);
    } catch (error: unknown) {
        console.error('Error fetching daily rental ranking:', error);
        res.status(500).json({ message: 'Error fetching most rented' });
    }
};
