import { Router } from 'express';
import { listOrders } from '../controllers/checkoutController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
router.use(requireAuth, requireRole('admin'));
router.get('/', listOrders);
export default router;
