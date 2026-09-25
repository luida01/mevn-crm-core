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

const app = express();
const PORT = Number.parseInt(process.env.PORT || '5000', 10);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mevn-crm';

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'Stripe-Signature']
}));
// Stripe signature verification needs the exact raw body before JSON parsing.
app.use('/api/payments/webhook', express.raw({ type: 'application/json', limit: '1mb' }), paymentWebhookRoutes);
app.use(express.json({ limit: '1mb' }));

app.get('/health/live', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get('/health/ready', (_req, res) => {
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not-ready' });
});

app.get('/', (_req, res) => {
    res.send('MEVN CRM API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/mangas', mangaRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', orderRoutes);

app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
        next(error);
        return;
    }

    if (error instanceof Error && error.message === 'Origin not allowed by CORS') {
        res.status(403).json({ message: 'CORS policy does not allow this origin' });
        return;
    }

    console.error('Unhandled API error:', error);
    res.status(500).json({ message: 'Internal server error' });
});

const validateConfiguration = (): void => {
    if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
        throw new Error('PORT must be an integer between 1 and 65535');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || Buffer.byteLength(jwtSecret, 'utf8') < 32) {
        throw new Error('JWT_SECRET must contain at least 32 bytes');
    }

    if (!process.env.ADMIN_USERNAME?.trim()) {
        throw new Error('ADMIN_USERNAME must be configured');
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || adminPassword.length < 12) {
        throw new Error('ADMIN_PASSWORD must contain at least 12 characters');
    }
};

const startServer = async (): Promise<void> => {
    validateConfiguration();
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
    console.log('Connected to MongoDB');

    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    const shutdown = (): void => {
        console.log('Shutdown signal received; closing HTTP server');
        server.close(() => {
            void mongoose.disconnect().then(() => {
                console.log('MongoDB connection closed');
            }).catch((error: unknown) => {
                console.error('Error closing MongoDB connection:', error);
                process.exitCode = 1;
            });
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
};

void startServer().catch(async (error: unknown) => {
    console.error('Unable to start API:', error);
    await mongoose.disconnect();
    process.exitCode = 1;
});
