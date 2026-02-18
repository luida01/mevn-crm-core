import { Router } from 'express';
import { getMangas, getManga, createManga, updateManga, deleteManga, searchMangas, searchRemoteMangas, fetchMangaDexCover } from '../controllers/mangaController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/cover', fetchMangaDexCover); // MangaDex Cover Search
router.get('/search-remote', searchRemoteMangas); // Remote search
router.get('/search', searchMangas); // Local search
router.get('/', getMangas);
router.get('/:id', getManga);
router.post('/', requireAuth, requireRole('admin'), createManga);
router.put('/:id', requireAuth, requireRole('admin'), updateManga);
router.delete('/:id', requireAuth, requireRole('admin'), deleteManga);

export default router;
