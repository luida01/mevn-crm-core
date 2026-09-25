import { Router } from 'express';
import { stripeWebhook } from '../controllers/checkoutController';

const router = Router();
router.post('/', stripeWebhook);
export default router;
