import express from 'express';
import {
    getTopRatedMangas,
    getRecentArrivals,
    getThematicCollections,
    getMangasByAuthor,
    getTopAuthors,
    getMostReadThisWeek,
    getMostRentedToday
} from '../controllers/shopController';

const router = express.Router();

router.get('/top-rated', getTopRatedMangas);
router.get('/recent', getRecentArrivals);
router.get('/collections/:theme', getThematicCollections);
router.get('/author/:author', getMangasByAuthor);
router.get('/top-authors', getTopAuthors);
router.get('/most-read-week', getMostReadThisWeek);
router.get('/most-rented-today', getMostRentedToday);

export default router;
