import { createHmac, timingSafeEqual } from 'node:crypto';
import { createMailTransport } from './mail';
import mongoose from 'mongoose';
import StockAlert from '../models/StockAlert';
import Manga from '../models/Manga';
import { serializeManga } from './mangaSeries';

export const DAY = 86_400_000;
type Action = 'confirm' | 'unsubscribe';
type TokenRecord = { _id: mongoose.Types.ObjectId; generation: string };
export const mailConfigured = (): boolean => Boolean(process.env.SMTP_HOST && process.env.MAIL_FROM && process.env.SHOP_URL && process.env.JWT_SECRET);

const signature = (record: TokenRecord, action: Action): string => createHmac('sha256', process.env.JWT_SECRET || '')
    .update(`stock-alert:${record._id}:${record.generation}:${action}`).digest('hex');
export const alertToken = (record: TokenRecord, action: Action): string => `${record._id}.${signature(record, action)}`;
export const findAlertByToken = async (token: unknown, action: Action) => {
    if (typeof token !== 'string' || !/^[a-f0-9]{24}\.[a-f0-9]{64}$/.test(token)) return null;
    const [id, supplied] = token.split('.');
    const record = await StockAlert.findOne({ _id: id, expiresAt: { $gt: new Date() } });
    if (!record || !timingSafeEqual(Buffer.from(supplied, 'hex'), Buffer.from(signature(record, action), 'hex'))) return null;
    return record;
};

const escapeHtml = (text: string): string => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
const link = (record: TokenRecord, action: Action): string => {
    const url = new URL('/avisos-stock', process.env.SHOP_URL);
    url.hash = new URLSearchParams({ action, token: alertToken(record, action) }).toString();
    return url.toString();
};

// The subscription itself is a durable mail queue. Atomic leases prevent parallel
// requests/cron invocations from processing the same subscription simultaneously.
export const processStockAlerts = async (mangaId?: string): Promise<void> => {
    if (!mailConfigured()) return;
    const now = new Date();
    const available = await Manga.find({ ...(mangaId ? { _id: mangaId } : {}), stock: { $gt: 0 } }).select('_id').lean();
    const eligible = {
        ...(mangaId ? { manga: mangaId } : {}),
        expiresAt: { $gt: now }, nextAttemptAt: { $lte: now }, lockedUntil: { $lte: now },
        $or: [
            { status: 'pending' as const, confirmationSentAt: { $exists: false } },
            { status: 'active' as const, manga: { $in: available.map(item => item._id) } }
        ]
    };
    const smtp = createMailTransport();
    try {
        await Promise.all(Array.from({ length: 5 }, async () => {
            const lock = new Date(Date.now() + 120_000);
            const alert = await StockAlert.findOneAndUpdate(eligible, { $set: { lockedUntil: lock } }, { returnDocument: 'after', sort: { nextAttemptAt: 1 } });
            if (!alert) return;
            const owned = { _id: alert._id, generation: alert.generation, lockedUntil: lock };
            try {
                const manga = await Manga.findById(alert.manga).populate('series');
                if (!manga) {
                    await StockAlert.deleteOne(owned);
                    return;
                }
                const confirmation = alert.status === 'pending';
                if (!confirmation && manga.stock < 1) {
                    await StockAlert.updateOne(owned, { $set: { lockedUntil: new Date(0) } });
                    return;
                }
                // Cancellation may happen while the worker is loading the title.
                if (!await StockAlert.exists({ ...owned, status: alert.status })) return;
                const title = String(serializeManga(manga).title);
                const volume = `${title} · Vol. ${manga.volume}`;
                const en = alert.locale === 'en';
                const subject = confirmation
                    ? (en ? 'MangaGo: confirm your stock alert' : 'MangaGo: confirma tu aviso de stock')
                    : (en ? `Back in stock: ${volume}` : `¡Disponible otra vez! ${volume}`);
                const intro = confirmation
                    ? (en ? `We registered your interest in ${volume}. Confirm your email to activate a one-time availability alert. This link expires in 7 days.` : `Registramos tu interés en ${volume}. Confirma tu correo para activar un único aviso cuando haya stock. El enlace vence en 7 días.`)
                    : (en ? `${volume} is available again. Stock may change; this email does not reserve a copy.` : `${volume} vuelve a tener stock. La disponibilidad puede cambiar; este correo no reserva un ejemplar.`);
                const actionUrl = confirmation ? link(alert, 'confirm') : new URL(`/catalogo?q=${encodeURIComponent(title)}`, process.env.SHOP_URL).toString();
                const actionText = confirmation ? (en ? 'Activate alert' : 'Activar aviso') : (en ? 'View catalog' : 'Ver catálogo');
                const unsubscribe = link(alert, 'unsubscribe');
                const footer = en ? 'Cancel this alert. If you did not request it, you can ignore this email.' : 'Cancelar este aviso. Si no lo solicitaste, puedes ignorar este correo.';
                const sent = await smtp.sendMail({
                    from: process.env.MAIL_FROM, to: { address: alert.email, name: '' }, subject,
                    messageId: `<stock-${alert._id}-${alert.generation}-${confirmation ? 'confirm' : 'available'}@mangago>`,
                    text: `${intro}\n\n${actionText}: ${actionUrl}\n\n${footer}\n${unsubscribe}`,
                    html: `<html lang="${en ? 'en' : 'es'}"><body style="font-family:Arial,sans-serif;line-height:1.6;color:#243b31;max-width:600px;margin:auto;padding:24px"><h1>MangaGo</h1><p>${escapeHtml(intro)}</p><p><a href="${escapeHtml(actionUrl)}" style="display:inline-block;padding:12px 20px;background:#315b4c;color:white;border-radius:10px">${actionText}</a></p><p><a href="${escapeHtml(unsubscribe)}">${escapeHtml(footer)}</a></p></body></html>`
                });
                if (!sent.accepted.length) throw new Error('SMTP_REJECTED');
                await StockAlert.updateOne({ ...owned, ...(confirmation ? {} : { status: 'active' }) }, {
                    $set: { lockedUntil: new Date(0), attempts: 0,
                        ...(confirmation ? { confirmationSentAt: new Date() } : { status: 'notified', notifiedAt: new Date(), expiresAt: new Date(Date.now() + 7 * DAY) }) },
                    $unset: { lastError: 1 }
                });
            } catch {
                // Keep retry state without logging recipient addresses or provider credentials.
                await StockAlert.updateOne(owned, {
                    $set: { lockedUntil: new Date(0), nextAttemptAt: new Date(Date.now() + Math.min(3600, 60 * 2 ** Math.min(alert.attempts, 6)) * 1000), lastError: 'DELIVERY_FAILED' },
                    $inc: { attempts: 1 }
                });
                console.warn('Stock alert delivery deferred for retry.');
            }
        }));
    } finally { smtp.close(); }
};

export const processStockAlertsSafely = async (mangaId?: string): Promise<void> => {
    try { await processStockAlerts(mangaId); }
    catch { console.warn('Stock alert queue could not be processed; it will be retried.'); }
};
