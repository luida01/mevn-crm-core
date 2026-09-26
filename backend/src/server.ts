import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app';
import { expireOverdueCheckouts } from './controllers/checkoutController';

const PORT = Number.parseInt(process.env.PORT || '5000', 10);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mevn-crm';

const validateConfiguration = (): void => {
    if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) throw new Error('PORT must be an integer between 1 and 65535');
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || Buffer.byteLength(jwtSecret, 'utf8') < 32) throw new Error('JWT_SECRET must contain at least 32 bytes');
    if (!process.env.ADMIN_USERNAME?.trim()) throw new Error('ADMIN_USERNAME must be configured');
    if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters');
};

const startServer = async (): Promise<void> => {
    validateConfiguration();
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
    console.log('Connected to MongoDB');
    const reservationSweep = setInterval(() => {
        void expireOverdueCheckouts().catch((error: unknown) => console.error('Checkout reservation cleanup failed:', error));
    }, 60_000);
    reservationSweep.unref();
    void expireOverdueCheckouts().catch((error: unknown) => console.error('Checkout reservation cleanup failed:', error));

    const server = app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    const shutdown = (): void => {
        console.log('Shutdown signal received; closing HTTP server');
        clearInterval(reservationSweep);
        server.close(() => {
            void mongoose.disconnect().then(() => console.log('MongoDB connection closed')).catch((error: unknown) => {
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
