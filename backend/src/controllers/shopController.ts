import { Request, Response } from 'express';
import Manga from '../models/Manga';
import Rental from '../models/Rental';
import { escapeRegex, parseLimit } from '../utils/requestBody';
export const getCatalog = async (req: Request, res: Response) => {
    const search = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (search.length > 100) return res.status(400).json({ message: 'Search must be at most 100 characters' });
    const title = typeof req.query.title === 'string' ? req.query.title.trim() : '';
    const author = typeof req.query.author === 'string' ? req.query.author.trim() : '';
    const volume = Number.parseInt(String(req.query.volume || ''), 10);
    const mode = req.query.mode === 'purchase' || req.query.mode === 'rental' ? req.query.mode : '';
    const page = Math.max(1, Math.min(100000, Number.parseInt(String(req.query.page || '1'), 10) || 1));
    const limit = parseLimit(req.query.limit, 12, 48);
    const query: Record<string, unknown> = {};
    if (search) query.$or = ['title', 'author', 'genre'].map(field => ({ [field]: { $regex: escapeRegex(search), $options: 'i' } }));
    if (title.length > 200 || author.length > 200) return res.status(400).json({ message: 'Title and author filters must be at most 200 characters' });
    if (title) query.title = title;
    if (author) query.author = { $regex: `^${escapeRegex(author)}$`, $options: 'i' };
    if (Number.isInteger(volume) && volume > 0) query.volume = volume;
    if (req.query.availability === 'available') query.stock = { $gt: 0 };
    if (req.query.availability === 'unavailable') query.stock = 0;
    if (mode === 'purchase') query.price = { $gt: 0 };
    if (mode === 'rental') query.rentalPrice = { $gt: 0 };
    try {
        const [items, total] = await Promise.all([
            Manga.find(query).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
            Manga.countDocuments(query)
        ]);
        res.set('Cache-Control', 'no-store').json({ items, total, page, pages: Math.ceil(total / limit) });
    } catch (error: unknown) {
        console.error('Error loading catalog:', error);
        res.status(500).json({ message: 'Could not load catalog' });
    }
};

export const getCatalogFilters = async (req: Request, res: Response) => {
    const title = typeof req.query.title === 'string' ? req.query.title.trim() : '';
    if (title.length > 200) return res.status(400).json({ message: 'Title must be at most 200 characters' });
    try {
        const [titles, authors, volumes] = await Promise.all([
            Manga.distinct('title'),
            Manga.distinct('author'),
            title ? Manga.distinct('volume', { title }) : Promise.resolve([] as number[])
        ]);
        res.set('Cache-Control', 'no-store').json({
            titles: titles.filter((value): value is string => typeof value === 'string').sort((a, b) => a.localeCompare(b)),
            authors: authors.filter((value): value is string => typeof value === 'string').sort((a, b) => a.localeCompare(b)),
            volumes: volumes.filter((value): value is number => typeof value === 'number').sort((a, b) => a - b)
        });
    } catch (error: unknown) {
        console.error('Error loading catalog filters:', error);
        res.status(500).json({ message: 'Could not load catalog filters' });
    }
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

// Recent additions remain visible even when their inventory is empty.
export const getRecentArrivals = async (req: Request, res: Response) => {
    try {
        const limit = parseLimit(req.query.limit, 12);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const mangas = await Manga.find({
            createdAt: { $gte: thirtyDaysAgo }
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
        const query: Record<string, unknown> = { stock: { $gt: 0 } };

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
