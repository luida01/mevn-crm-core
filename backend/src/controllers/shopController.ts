import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Manga, { IManga } from '../models/Manga';
import MangaSeries from '../models/MangaSeries';
import Rental from '../models/Rental';
import { escapeRegex, parseLimit } from '../utils/requestBody';
import { loadSeriesForVolumeIds, serializeMangas } from '../services/mangaSeries';

const seriesFilter = (search: string, title: string, author: string) => {
    const filter: Record<string, unknown> = {};
    if (title) filter.title = title;
    if (author) filter.author = { $regex: `^${escapeRegex(author)}$`, $options: 'i' };
    if (search) filter.$or = ['title', 'author', 'genre', 'alternativeTitles'].map(field => ({ [field]: { $regex: escapeRegex(search), $options: 'i' } }));
    return filter;
};

export const getCatalog = async (req: Request, res: Response) => {
    const search = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const title = typeof req.query.title === 'string' ? req.query.title.trim() : '';
    const author = typeof req.query.author === 'string' ? req.query.author.trim() : '';
    if (search.length > 100) return res.status(400).json({ message: 'Search must be at most 100 characters' });
    if (title.length > 200 || author.length > 200) return res.status(400).json({ message: 'Title and author filters must be at most 200 characters' });
    const volume = Number.parseInt(String(req.query.volume || ''), 10);
    const mode = req.query.mode === 'purchase' || req.query.mode === 'rental' ? req.query.mode : '';
    const page = Math.max(1, Math.min(100000, Number.parseInt(String(req.query.page || '1'), 10) || 1));
    const limit = parseLimit(req.query.limit, 12, 48);
    try {
        const filter: Record<string, unknown> = {};
        if (search || title || author) {
            const series = await MangaSeries.find(seriesFilter(search, title, author)).select('_id').lean();
            filter.series = { $in: series.map(item => item._id) };
        }
        if (Number.isInteger(volume) && volume > 0) filter.volume = volume;
        if (req.query.availability === 'available') filter.stock = { $gt: 0 };
        if (req.query.availability === 'unavailable') filter.stock = 0;
        if (mode === 'purchase') filter.price = { $gt: 0 };
        if (mode === 'rental') filter.rentalPrice = { $gt: 0 };
        const [volumes, total] = await Promise.all([
            Manga.find(filter).populate('series').sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
            Manga.countDocuments(filter)
        ]);
        res.set('Cache-Control', 'no-store').json({ items: serializeMangas(volumes), total, page, pages: Math.ceil(total / limit) });
    } catch (error: unknown) {
        console.error('Error loading catalog:', error);
        res.status(500).json({ message: 'Could not load catalog' });
    }
};

export const getCatalogFilters = async (req: Request, res: Response) => {
    const title = typeof req.query.title === 'string' ? req.query.title.trim() : '';
    if (title.length > 200) return res.status(400).json({ message: 'Title must be at most 200 characters' });
    try {
        const series = await MangaSeries.find().select('title author').sort({ title: 1 }).lean();
        const titles = [...new Set(series.map(item => item.title))];
        const authors = [...new Set(series.map(item => item.author))].sort((a, b) => a.localeCompare(b));
        let volumes: number[] = [];
        if (title) {
            const selectedSeries = series.filter(item => item.title === title).map(item => item._id);
            volumes = await Manga.distinct('volume', { series: { $in: selectedSeries } });
            volumes.sort((a, b) => a - b);
        }
        res.set('Cache-Control', 'no-store').json({ titles, authors, volumes });
    } catch (error: unknown) {
        console.error('Error loading catalog filters:', error);
        res.status(500).json({ message: 'Could not load catalog filters' });
    }
};

const serializedSorted = (volumes: IManga[], limit: number) =>
    serializeMangas(volumes).sort((a, b) => Number(b.malScore || 0) - Number(a.malScore || 0)).slice(0, limit);

export const getTopRatedMangas = async (req: Request, res: Response) => {
    try {
        const limit = parseLimit(req.query.limit, 10);
        const ratedSeries = await MangaSeries.find({ malScore: { $gte: 7.5 } }).select('_id').lean();
        let volumes = await Manga.find({ series: { $in: ratedSeries.map(item => item._id) }, stock: { $gt: 0 } }).populate('series');
        if (!volumes.length) volumes = await Manga.find({ stock: { $gt: 0 } }).populate('series').sort({ createdAt: -1 }).limit(limit);
        res.json(serializedSorted(volumes, limit));
    } catch (error: unknown) {
        console.error('Error fetching top-rated mangas:', error);
        res.status(500).json({ message: 'Error fetching top-rated mangas' });
    }
};

export const getRecentArrivals = async (req: Request, res: Response) => {
    try {
        const limit = parseLimit(req.query.limit, 12);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const mangas = await Manga.find({ createdAt: { $gte: thirtyDaysAgo } }).populate('series').sort({ createdAt: -1 }).limit(limit);
        res.json(serializeMangas(mangas));
    } catch (error: unknown) {
        console.error('Error fetching recent arrivals:', error);
        res.status(500).json({ message: 'Error fetching recent arrivals' });
    }
};

export const getThematicCollections = async (req: Request, res: Response) => {
    try {
        const { theme } = req.params;
        const seriesFilter: Record<string, unknown> = {};
        switch (theme) {
            case 'beginner':
                seriesFilter.genre = { $regex: 'Action|Adventure|Shounen', $options: 'i' };
                seriesFilter.malScore = { $gte: 7.5 };
                break;
            case 'anime-adaptations':
                seriesFilter.status = 'Publishing';
                seriesFilter.malScore = { $gte: 7.0 };
                break;
            case 'horror':
                seriesFilter.genre = { $regex: 'Horror|Psychological|Thriller', $options: 'i' };
                break;
            default:
                return res.status(400).json({ message: 'Invalid theme' });
        }
        const series = await MangaSeries.find(seriesFilter).select('_id').lean();
        const mangas = await Manga.find({ series: { $in: series.map(item => item._id) }, stock: { $gt: 0 } })
            .populate('series').sort({ createdAt: -1 }).limit(12);
        res.json(serializedSorted(mangas, 12));
    } catch (error: unknown) {
        console.error('Error fetching thematic collection:', error);
        res.status(500).json({ message: 'Error fetching thematic collection' });
    }
};

export const getMangasByAuthor = async (req: Request, res: Response) => {
    try {
        const { author } = req.params;
        const limit = parseLimit(req.query.limit, 12);
        if (author.length > 100) return res.status(400).json({ message: 'Author name must be at most 100 characters' });
        const series = await MangaSeries.find({ author: { $regex: escapeRegex(author), $options: 'i' } }).select('_id').lean();
        const mangas = await Manga.find({ series: { $in: series.map(item => item._id) }, stock: { $gt: 0 } }).populate('series');
        res.json(serializedSorted(mangas, limit));
    } catch (error: unknown) {
        console.error('Error fetching mangas by author:', error);
        res.status(500).json({ message: 'Error fetching mangas by author' });
    }
};

export const getTopAuthors = async (req: Request, res: Response) => {
    try {
        const limit = parseLimit(req.query.limit, 6);
        const authors = await Manga.aggregate([
            { $match: { stock: { $gt: 0 } } },
            { $lookup: { from: MangaSeries.collection.name, localField: 'series', foreignField: '_id', as: 'seriesData' } },
            { $unwind: '$seriesData' },
            { $group: { _id: '$seriesData.author', count: { $sum: 1 }, avgScore: { $avg: '$seriesData.malScore' } } },
            { $sort: { count: -1 } },
            { $limit: limit }
        ]);
        res.json(authors);
    } catch (error: unknown) {
        console.error('Error fetching top authors:', error);
        res.status(500).json({ message: 'Error fetching top authors' });
    }
};

const getRentalRanking = async (since: Date, rankingField: 'weeklyRentals' | 'todayRentals', limit: number) => {
    const grouped = await Rental.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
        { $match: { startDate: { $gte: since } } },
        { $group: { _id: '$manga', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: limit }
    ]);
    const mangas = await loadSeriesForVolumeIds(grouped.map(item => item._id));
    const countById = new Map(grouped.map(item => [item._id.toString(), item.count]));
    return mangas.map(manga => ({ ...manga, [rankingField]: countById.get(String(manga._id)) || 0 }));
};

export const getMostReadThisWeek = async (req: Request, res: Response) => {
    try {
        const limit = parseLimit(req.query.limit, 10);
        res.json(await getRentalRanking(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'weeklyRentals', limit));
    } catch (error: unknown) {
        console.error('Error fetching weekly rental ranking:', error);
        res.status(500).json({ message: 'Error fetching most read' });
    }
};

export const getMostRentedToday = async (req: Request, res: Response) => {
    try {
        const limit = parseLimit(req.query.limit, 10);
        const since = new Date();
        since.setUTCHours(0, 0, 0, 0);
        res.json(await getRentalRanking(since, 'todayRentals', limit));
    } catch (error: unknown) {
        console.error('Error fetching daily rental ranking:', error);
        res.status(500).json({ message: 'Error fetching most rented' });
    }
};
