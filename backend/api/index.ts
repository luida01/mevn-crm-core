/// <reference path="../src/types/express.d.ts" />
import 'dotenv/config';
import mongoose from 'mongoose';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';
import { expireOverdueCheckouts } from '../src/controllers/checkoutController';

const uri = process.env.MONGODB_URI;
let connection: Promise<typeof mongoose> | undefined;
let lastReservationSweep = 0;

const connectToDatabase = async (): Promise<void> => {
    if (!uri) throw new Error('MONGODB_URI must be configured in Vercel');
    if (mongoose.connection.readyState === 1) return;
    if (!connection) {
        connection = mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 }).catch((error: unknown) => {
            connection = undefined;
            throw error;
        });
    }
    try {
        await connection;
    } finally {
        connection = undefined;
    }
};

export default async function handler(request: VercelRequest, response: VercelResponse): Promise<void> {
    try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret || Buffer.byteLength(jwtSecret, 'utf8') < 32) throw new Error('JWT_SECRET must contain at least 32 bytes');
        if (!process.env.ADMIN_USERNAME?.trim() || !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 12) {
            throw new Error('ADMIN_USERNAME and a 12-character ADMIN_PASSWORD must be configured');
        }
        await connectToDatabase();
        if (Date.now() - lastReservationSweep > 60_000) {
            await expireOverdueCheckouts();
            lastReservationSweep = Date.now();
        }
        app(request, response);
    } catch (error: unknown) {
        console.error('Vercel API initialization failed:', error);
        response.status(503).json({ message: 'API is not ready. Check server configuration.' });
    }
}
