import { Router } from 'express';
import { getMangas, getManga, createManga, updateManga, deleteManga, searchMangas, searchRemoteMangas, fetchMangaDexCover } from '../controllers/mangaController';

const router = Router();

router.get('/cover', fetchMangaDexCover); // MangaDex Cover Search
router.get('/search-remote', searchRemoteMangas); // Remote search
router.get('/search', searchMangas); // Local search
router.get('/', getMangas);
router.get('/:id', getManga);
router.post('/', createManga);
router.put('/:id', updateManga);
router.delete('/:id', deleteManga);

export default router;
