import { Router } from 'express';
import { getRentals, createRental, returnRental, togglePayment } from '../controllers/rentalController';

const router = Router();

router.get('/', getRentals);
router.post('/', createRental);
router.put('/:id/return', returnRental);
router.put('/:id/payment', togglePayment);

export default router;
