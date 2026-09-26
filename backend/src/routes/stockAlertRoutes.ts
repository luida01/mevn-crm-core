import { Router } from 'express';
import mongoose from 'mongoose';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { rateLimit } from 'express-rate-limit';
import Manga from '../models/Manga';
import StockAlert from '../models/StockAlert';
import { DAY, findAlertByToken, mailConfigured, processStockAlerts, processStockAlertsSafely } from '../services/stockAlerts';

const router = Router();
const limit = rateLimit({ windowMs: 15 * 60_000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, message: { code: 'RATE_LIMITED' } });
const accepted = { message: 'Check your inbox to activate the alert if eligible.' };

router.post('/', limit, async (req, res) => {
    const { mangaId, email, locale, consent } = req.body || {};
    if (typeof mangaId !== 'string' || !mongoose.isValidObjectId(mangaId) || typeof email !== 'string'
        || email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email.trim())
        || !['es', 'en'].includes(locale) || consent !== true) {
        res.status(400).json({ code: 'INVALID_INPUT' }); return;
    }
    if (!mailConfigured()) { res.status(503).json({ code: 'EMAIL_UNAVAILABLE' }); return; }
    try {
        const manga = await Manga.findById(mangaId).select('stock');
        if (!manga) { res.status(404).json({ code: 'NOT_FOUND' }); return; }
        if (manga.stock > 0) { res.status(409).json({ code: 'IN_STOCK' }); return; }
        const normalizedEmail = email.trim().toLowerCase();
        // A persistent per-recipient limit also applies across serverless instances.
        const recent = await StockAlert.countDocuments({ email: normalizedEmail, requestedAt: { $gt: new Date(Date.now() - DAY) } });
        if (recent >= 5) { res.status(202).json(accepted); return; }
        await StockAlert.init();
        const existing = await StockAlert.findOne({ manga: mangaId, email: normalizedEmail });
        if (existing && (['notified', 'cancelled'].includes(existing.status) || existing.expiresAt <= new Date()) && existing.requestedAt.getTime() < Date.now() - DAY) {
            await StockAlert.updateOne({ _id: existing._id, generation: existing.generation }, {
                $set: { status: 'pending', generation: randomUUID(), locale, requestedAt: new Date(), expiresAt: new Date(Date.now() + 7 * DAY), nextAttemptAt: new Date(), lockedUntil: new Date(0), attempts: 0 },
                $unset: { confirmationSentAt: 1, notifiedAt: 1, lastError: 1 }
            });
        } else if (!existing) {
            await StockAlert.create({ manga: mangaId, email: normalizedEmail, locale, expiresAt: new Date(Date.now() + 7 * DAY) });
        }
        await processStockAlertsSafely(mangaId);
        res.status(202).json(accepted);
    } catch (error: unknown) {
        if (typeof error === 'object' && error && 'code' in error && error.code === 11000) { res.status(202).json(accepted); return; }
        res.status(500).json({ code: 'SAVE_FAILED' });
    }
});

router.post('/:action', limit, async (req, res) => {
    const action = req.params.action;
    if (action !== 'confirm' && action !== 'unsubscribe') { res.sendStatus(404); return; }
    try {
        const alert = await findAlertByToken(req.body?.token, action);
        if (!alert) { res.status(400).json({ code: 'INVALID_TOKEN' }); return; }
        if (action === 'unsubscribe') {
            await StockAlert.updateOne({ _id: alert._id, generation: alert.generation }, { $set: { status: 'cancelled', expiresAt: new Date(Date.now() + 7 * DAY) } });
        } else {
            if (alert.status === 'cancelled') { res.status(400).json({ code: 'INVALID_TOKEN' }); return; }
            await StockAlert.updateOne({ _id: alert._id, generation: alert.generation, status: 'pending' }, { $set: { status: 'active', expiresAt: new Date(Date.now() + 90 * DAY), nextAttemptAt: new Date() } });
            await processStockAlertsSafely(alert.manga.toString());
        }
        res.json({ ok: true });
    } catch { res.status(500).json({ code: 'SAVE_FAILED' }); }
});

// Configure a scheduler to call this on Vercel; local Node also runs a timer.
router.get('/process', async (req, res) => {
    const expected = `Bearer ${process.env.CRON_SECRET || ''}`;
    const supplied = req.get('Authorization') || '';
    if (!process.env.CRON_SECRET || Buffer.byteLength(expected) !== Buffer.byteLength(supplied) || !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) {
        res.sendStatus(401); return;
    }
    if (!mailConfigured()) { res.status(503).json({ code: 'EMAIL_UNAVAILABLE' }); return; }
    try { await processStockAlerts(); res.json({ ok: true }); }
    catch { res.status(503).json({ code: 'QUEUE_UNAVAILABLE' }); }
});

export default router;
