import Order, { IOrderReceipt } from '../models/Order';
import { createMailTransport, escapeEmailHtml as escape, smtpConfigured } from './mail';

export const renderReceiptEmail = (receipt: IOrderReceipt, locale: 'es' | 'en') => {
    const en = locale === 'en';
    const money = (value: number) => new Intl.NumberFormat(en ? 'en-US' : 'es-BO', { style: 'currency', currency: receipt.currency.toUpperCase() }).format(value);
    const title = en ? 'Your test order receipt' : 'Tu comprobante de pedido de prueba';
    const notice = en ? 'TEST PAYMENT · INTERNAL RECEIPT · NOT A TAX INVOICE. No real payment was collected.' : 'PAGO DE PRUEBA · COMPROBANTE INTERNO · SIN VALIDEZ FISCAL. No se realizó ningún cobro real.';
    const date = new Date(receipt.issuedAt).toLocaleString(en ? 'en-US' : 'es-BO', { timeZone: 'UTC' }) + ' UTC';
    const details = receipt.items.map(item => `${item.kind === 'rental' ? (en ? `Rental (${item.days} days)` : `Alquiler (${item.days} días)`) : (en ? 'Purchase' : 'Compra')} · ${item.title} · Vol. ${item.volume} × ${item.quantity} · ${money(item.unitAmount)} ${en ? 'each' : 'por unidad'} = ${money(item.lineTotal)}`);
    const total = `${en ? 'Test total' : 'Total de prueba'}: ${money(receipt.total)}`;
    const issuer = [receipt.issuer.businessName, receipt.issuer.address, receipt.issuer.contactEmail, receipt.issuer.phone].filter(Boolean).join(' · ');
    return {
        subject: `${title} · ${receipt.number}`,
        text: `${title}\n${notice}\n\n${issuer}\n${receipt.number} · ${date}\n${receipt.customer.name}\n${receipt.customer.email}\n\n${details.join('\n')}\n\n${total}`,
        html: `<html lang="${locale}"><body style="font-family:Arial,sans-serif;line-height:1.6;max-width:640px;margin:auto;padding:24px;color:#243b31"><h1>${escape(title)}</h1><p style="padding:12px;background:#fff0ce;border-radius:8px">${escape(notice)}</p><p>${escape(issuer)}</p><p><strong>${escape(receipt.number)}</strong><br>${escape(date)}</p><p>${escape(receipt.customer.name)}<br>${escape(receipt.customer.email)}</p><ul>${details.map(line => `<li style="margin:12px 0">${escape(line)}</li>`).join('')}</ul><h2>${escape(total)}</h2></body></html>`
    };
};

export const processReceiptEmails = async (orderId?: string): Promise<void> => {
    if (!smtpConfigured()) return;
    const smtp = createMailTransport();
    try {
        await Promise.all(Array.from({ length: orderId ? 1 : 5 }, async () => {
            const lock = new Date(Date.now() + 120_000);
            const order = await Order.findOneAndUpdate({
                ...(orderId ? { _id: orderId } : {}), status: 'paid', 'receipt.payment.provider': 'Stripe test mode',
                'receiptEmail.status': 'pending', 'receiptEmail.nextAttemptAt': { $lte: new Date() }, 'receiptEmail.lockedUntil': { $lte: new Date() }
            }, { $set: { 'receiptEmail.lockedUntil': lock } }, { returnDocument: 'after', sort: { 'receiptEmail.nextAttemptAt': 1 } });
            if (!order?.receipt || !order.receiptEmail) return;
            const owned = { _id: order._id, 'receiptEmail.status': 'pending' as const, 'receiptEmail.lockedUntil': lock };
            try {
                const content = renderReceiptEmail(order.receipt, order.locale || 'es');
                const sent = await smtp.sendMail({ ...content, from: process.env.MAIL_FROM,
                    to: { address: order.receipt.customer.email, name: '' },
                    messageId: `<receipt-test-${order._id}@mangago>` });
                if (!sent.accepted.length) throw new Error('SMTP_REJECTED');
                await Order.updateOne(owned, { $set: { 'receiptEmail.status': 'sent', 'receiptEmail.sentAt': new Date(), 'receiptEmail.lockedUntil': new Date(0) }, $unset: { 'receiptEmail.lastError': 1 } });
            } catch {
                await Order.updateOne(owned, { $set: {
                    'receiptEmail.lockedUntil': new Date(0), 'receiptEmail.lastError': 'DELIVERY_FAILED',
                    'receiptEmail.nextAttemptAt': new Date(Date.now() + Math.min(3600, 60 * 2 ** Math.min(order.receiptEmail.attempts, 6)) * 1000)
                }, $inc: { 'receiptEmail.attempts': 1 } });
                console.warn('Receipt email deferred for retry.');
            }
        }));
    } finally { smtp.close(); }
};

export const processReceiptEmailsSafely = async (orderId?: string): Promise<void> => {
    try { await processReceiptEmails(orderId); }
    catch { console.warn('Receipt email queue unavailable; delivery will be retried.'); }
};
