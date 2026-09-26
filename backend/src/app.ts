import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import customerRoutes from './routes/customerRoutes';
import mangaRoutes from './routes/mangaRoutes';
import rentalRoutes from './routes/rentalRoutes';
import shopRoutes from './routes/shopRoutes';
import authRoutes from './routes/authRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import settingsRoutes from './routes/settingsRoutes';
import checkoutRoutes from './routes/checkoutRoutes';
import paymentWebhookRoutes from './routes/paymentWebhookRoutes';
import orderRoutes from './routes/orderRoutes';
import stockAlertRoutes from './routes/stockAlertRoutes';

const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
    .split(',').map((origin) => origin.trim()).filter(Boolean);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) callback(null, true);
        else callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'Stripe-Signature']
}));
// Stripe validates the signature against the exact unparsed request body.
app.use('/api/payments/webhook', express.raw({ type: 'application/json', limit: '1mb' }), paymentWebhookRoutes);
app.use(express.json({ limit: '1mb' }));

app.get('/health/live', (_req, res) => res.status(200).json({ status: 'ok' }));
app.get('/health/ready', (_req, res) => {
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not-ready' });
});
app.get('/', (_req, res) => res.send('MEVN CRM API is running'));

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/mangas', mangaRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/stock-alerts', stockAlertRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', orderRoutes);

app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) { next(error); return; }
    if (error instanceof Error && error.message === 'Origin not allowed by CORS') {
        res.status(403).json({ message: 'CORS policy does not allow this origin' });
        return;
    }
    console.error('Unhandled API error:', error);
    res.status(500).json({ message: 'Internal server error' });
});

export default app;
