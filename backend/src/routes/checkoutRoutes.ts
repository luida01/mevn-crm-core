import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { cancelCheckout, checkoutConfig, createCheckoutSession, getCheckoutConfirmation } from '../controllers/checkoutController';

const router = Router();
const checkoutLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false,
    message: { message: 'Demasiados intentos de checkout. Espera un momento y vuelve a intentarlo.' } });
router.get('/config', checkoutConfig);
router.post('/session', checkoutLimit, createCheckoutSession);
router.post('/cancel/:orderId', cancelCheckout);
router.get('/confirmation/:sessionId', getCheckoutConfirmation);
export default router;
