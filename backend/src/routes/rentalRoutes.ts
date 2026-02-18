import { Router } from 'express';
import { getRentals, createRental, returnRental, togglePayment } from '../controllers/rentalController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/', getRentals);
router.post('/', createRental);
router.put('/:id/return', returnRental);
router.put('/:id/payment', togglePayment);

export default router;
