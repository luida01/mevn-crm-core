import { Router } from 'express';
import { getMangas, getManga, createManga, updateManga, deleteManga, searchMangas, searchRemoteMangas, fetchMangaDexCover, getMangaDexVolumes } from '../controllers/mangaController';
import { requireAuth, requireRole } from '../middleware/auth';
import { addMangaStock } from '../controllers/mangaController';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/cover', fetchMangaDexCover); // MangaDex Cover Search
router.get('/volumes', getMangaDexVolumes);
router.get('/search-remote', searchRemoteMangas); // Remote search
router.get('/search', searchMangas); // Local search
router.get('/', getMangas);
router.get('/:id', getManga);
router.post('/', createManga);
router.put('/:id/stock', addMangaStock);
router.put('/:id', updateManga);
router.delete('/:id', deleteManga);

export default router;
