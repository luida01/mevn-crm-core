import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { randomBytes } from 'node:crypto';
import Stripe from 'stripe';
import Customer from '../models/Customer';
import Manga from '../models/Manga';
import Order, { IOrder, IOrderItem, OrderKind } from '../models/Order';
import Rental from '../models/Rental';
import { readBusinessSettings } from '../models/BusinessSettings';
import { serializeManga } from '../services/mangaSeries';

type CartInput = { mangaId: string; kind: OrderKind; quantity: number; days?: number };
const stripeSecret = () => process.env.STRIPE_SECRET_KEY || '';
const getStripe = (): Stripe | null => {
    const key = stripeSecret();
    return key.startsWith('sk_test_') ? new Stripe(key) : null;
};
const currency = () => (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();
// Stripe requires Checkout sessions to expire at least 30 minutes after creation;
// leave one minute for DB reservation and network latency before creating the session.
const checkoutExpiry = () => new Date(Date.now() + 31 * 60 * 1000);
const dollarsToCents = (amount: number) => Math.round((amount + Number.EPSILON) * 100);

export const checkoutConfig = (_req: Request, res: Response) => {
    res.json({ configured: Boolean(getStripe() && process.env.STRIPE_WEBHOOK_SECRET), provider: 'Stripe Checkout test mode', currency: currency() });
};

const releaseReservation = async (mangaId: mongoose.Types.ObjectId, orderId: mongoose.Types.ObjectId): Promise<void> => {
    const manga = await Manga.findOne({ _id: mangaId, 'reservations.orderId': orderId }, { reservations: { $elemMatch: { orderId } } }).lean();
    const reservation = manga?.reservations?.[0];
    if (!reservation) return;
    await Manga.updateOne({ _id: mangaId, 'reservations.orderId': orderId }, {
        $inc: { stock: reservation.quantity }, $pull: { reservations: { orderId } }
    });
};

const releaseOrderReservations = async (order: IOrder): Promise<void> => {
    const mangaIds = [...new Set(order.items.map(item => item.manga.toString()))];
    for (const id of mangaIds) await releaseReservation(new mongoose.Types.ObjectId(id), order._id);
};

const retainOrderReservations = async (order: IOrder): Promise<void> => {
    await Manga.updateMany({ 'reservations.orderId': order._id }, { $pull: { reservations: { orderId: order._id } } });
};

const createPaidOrderEffects = async (order: IOrder, session: Stripe.Checkout.Session): Promise<void> => {
    const details = session.customer_details;
    const email = (details?.email || order.customer.email).trim().toLowerCase();
    const fullName = (details?.name || order.customer.name).trim();
    const [firstName = 'Cliente', ...rest] = fullName.split(/\s+/).filter(Boolean);
    const customer = await Customer.findOneAndUpdate(
        { email },
        { $setOnInsert: { firstName, lastName: rest.join(' ') || 'Tienda', email, isActive: true, address: {} } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    for (const [index, item] of order.items.entries()) {
        if (item.kind !== 'rental') continue;
        const days = item.days || 1;
        for (let copy = 0; copy < item.quantity; copy += 1) {
            const checkoutLineKey = `${index}-${copy}`;
            const startDate = order.paidAt || new Date();
            await Rental.updateOne(
                { checkoutOrder: order._id, checkoutLineKey },
                { $setOnInsert: {
                    customer: customer._id, manga: item.manga, startDate,
                    dueDate: new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000),
                    status: 'ACTIVE', cost: item.unitAmount, isPaid: true, paidAt: startDate,
                    checkoutOrder: order._id, checkoutLineKey
                } },
                { upsert: true, runValidators: true }
            );
        }
    }

    const settings = await readBusinessSettings();
    const receiptItems = order.items.map(item => ({
        title: item.title, author: item.author, volume: item.volume, kind: item.kind,
        quantity: item.quantity, days: item.days || null, unitAmount: item.unitAmount, lineTotal: item.lineTotal
    }));
    await Order.updateOne({ _id: order._id, receipt: { $exists: false } }, {
        $set: { receipt: {
            number: `MG-${order._id.toString().slice(-10).toUpperCase()}`,
            issuedAt: order.paidAt || new Date(), fiscal: false,
            issuer: { businessName: settings.businessName, contactEmail: settings.contactEmail, phone: settings.phone, address: settings.address },
            customer: { name: fullName, email }, items: receiptItems, currency: order.currency, total: order.total,
            payment: { provider: 'Stripe test mode', paymentIntentId: session.payment_intent || null }
        } }
    });
    await retainOrderReservations(order);
};

export const createCheckoutSession = async (req: Request, res: Response) => {
    const stripe = getStripe();
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
        res.status(503).json({ message: 'La pasarela de prueba no está configurada. Añade STRIPE_SECRET_KEY (sk_test_) y STRIPE_WEBHOOK_SECRET.' }); return;
    }
    const idempotencyKey = req.get('Idempotency-Key');
    if (!idempotencyKey || idempotencyKey.length > 120 || !/^[\w.:=-]+$/.test(idempotencyKey)) {
        res.status(400).json({ message: 'La solicitud de pago necesita una clave de idempotencia válida.' }); return;
    }
    const body: unknown = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) { res.status(400).json({ message: 'El carrito no es válido.' }); return; }
    const input = body as Record<string, unknown>;
    const items = input.items;
    const customer = input.customer;
    if (!Array.isArray(items) || items.length < 1 || items.length > 40 || !customer || typeof customer !== 'object') {
        res.status(400).json({ message: 'Incluye entre 1 y 40 artículos y los datos de contacto.' }); return;
    }
    const contact = customer as Record<string, unknown>;
    if (typeof contact.name !== 'string' || contact.name.trim().length < 2 || contact.name.length > 160 ||
        typeof contact.email !== 'string' || contact.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
        res.status(400).json({ message: 'Indica un nombre y correo válidos.' }); return;
    }
    const requested = items as CartInput[];
    if (requested.some(line => !line || typeof line !== 'object' || !mongoose.isValidObjectId(line.mangaId) ||
        !['purchase', 'rental'].includes(line.kind) || !Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.quantity > 100 ||
        (line.kind === 'rental' && (!Number.isSafeInteger(line.days) || Number(line.days) < 1 || Number(line.days) > 30)))) {
        res.status(400).json({ message: 'Hay artículos con identificador, modalidad, cantidad o días inválidos.' }); return;
    }

    const existing = await Order.findOne({ idempotencyKey });
    if (existing?.stripeSessionId) {
        try {
            const session = await stripe.checkout.sessions.retrieve(existing.stripeSessionId);
            if (session.url && existing.status === 'pending') { res.json({ url: session.url, orderId: existing._id }); return; }
        } catch { /* create a new order only after the previous attempt has ended */ }
        res.status(409).json({ message: 'Esta solicitud de pago ya fue procesada. Actualiza tu carrito antes de volver a intentar.' }); return;
    }
    if (existing) { res.status(409).json({ message: 'Esta solicitud de pago está en proceso.' }); return; }

    const volumeIds = [...new Set(requested.map(line => line.mangaId))];
    const volumes = await Manga.find({ _id: { $in: volumeIds } }).populate('series');
    const mangaById = new Map(volumes.map(manga => [manga._id.toString(), manga]));
    const grouped = new Map<string, number>();
    requested.forEach(line => grouped.set(line.mangaId, (grouped.get(line.mangaId) || 0) + line.quantity));
    for (const [id, quantity] of grouped) {
        const manga = mangaById.get(id);
        if (!manga || manga.stock < quantity || requested.filter(line => line.mangaId === id).some(line =>
            (line.kind === 'purchase' && manga.price <= 0) || (line.kind === 'rental' && manga.rentalPrice <= 0))) {
            res.status(409).json({ message: 'El stock o la disponibilidad cambió. Actualiza el carrito e inténtalo de nuevo.' }); return;
        }
    }
    const orderItems: IOrderItem[] = requested.map(line => {
        const manga = mangaById.get(line.mangaId)!;
        const view = serializeManga(manga);
        const unitAmount = line.kind === 'purchase' ? manga.price : manga.rentalPrice * Number(line.days);
        return { manga: manga._id, title: String(view.title || 'Manga'), author: String(view.author || 'Desconocido'), volume: manga.volume,
            coverImage: manga.coverImage, kind: line.kind, quantity: line.quantity, days: line.kind === 'rental' ? line.days : undefined,
            unitAmount, lineTotal: unitAmount * line.quantity };
    });
    const total = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    if (!Number.isFinite(total) || total <= 0 || dollarsToCents(total) < 50) { res.status(400).json({ message: 'El total debe ser de al menos $0.50 para procesar el pago de prueba.' }); return; }

    const expiresAt = checkoutExpiry();
    const confirmationToken = randomBytes(32).toString('base64url');
    const order = await Order.create({ idempotencyKey, confirmationToken, status: 'pending', currency: currency(), items: orderItems, total,
        customer: { name: contact.name.trim(), email: contact.email.trim().toLowerCase() }, expiresAt });
    const reservedIds: string[] = [];
    try {
        for (const [id, quantity] of grouped) {
            const result = await Manga.updateOne({ _id: id, stock: { $gte: quantity } }, {
                $inc: { stock: -quantity }, $push: { reservations: { orderId: order._id, quantity, expiresAt } }
            });
            if (result.modifiedCount !== 1) throw new Error('INSUFFICIENT_STOCK');
            reservedIds.push(id);
        }
        const shopUrl = (process.env.SHOP_URL || 'http://localhost:5173').replace(/\/$/, '');
        const session = await stripe.checkout.sessions.create({
            mode: 'payment', currency: order.currency,
            payment_method_types: ['card'],
            customer_email: order.customer.email,
            customer_creation: 'always', billing_address_collection: 'auto',
            expires_at: Math.floor(expiresAt.getTime() / 1000),
            line_items: orderItems.map(item => ({ quantity: item.quantity, price_data: {
                currency: order.currency, unit_amount: dollarsToCents(item.unitAmount),
                product_data: { name: `${item.title} · Vol. ${item.volume}`, description: item.kind === 'rental' ? `Alquiler por ${item.days} día(s)` : 'Compra' }
            } })),
            metadata: { orderId: order._id.toString() },
            success_url: `${shopUrl}/pago/confirmacion?session_id={CHECKOUT_SESSION_ID}&token=${confirmationToken}`,
            cancel_url: `${shopUrl}/carrito?payment=cancelled&order_id=${order._id}&token=${confirmationToken}`
        }, { idempotencyKey: `order-${order._id}` });
        await Order.updateOne({ _id: order._id }, { $set: { stripeSessionId: session.id } });
        if (!session.url) throw new Error('Stripe no devolvió la URL del checkout.');
        res.status(201).json({ url: session.url, orderId: order._id });
    } catch (error: unknown) {
        for (const id of reservedIds) await releaseReservation(new mongoose.Types.ObjectId(id), order._id);
        await Order.updateOne({ _id: order._id }, { $set: { status: 'cancelled' } });
        if (error instanceof Error && error.message === 'INSUFFICIENT_STOCK') {
            res.status(409).json({ message: 'Alguien acaba de reservar la última unidad. Actualiza el carrito.' }); return;
        }
        console.error('Unable to create Stripe Checkout session:', error);
        res.status(502).json({ message: 'No se pudo iniciar el pago de prueba. El stock fue liberado; puedes volver a intentarlo.' });
    }
};

export const cancelCheckout = async (req: Request, res: Response) => {
    const stripe = getStripe();
    const orderId = req.params.orderId;
    const token: unknown = req.query.token;
    if (!stripe || !mongoose.isValidObjectId(orderId) || typeof token !== 'string' || token.length !== 43) {
        res.status(400).json({ message: 'La solicitud para cancelar esta reserva no es válida.' }); return;
    }
    try {
        const order = await Order.findOne({ _id: orderId, confirmationToken: token }).select('+confirmationToken stripeSessionId status');
        if (!order || !order.stripeSessionId) { res.status(404).json({ message: 'No se encontró la reserva.' }); return; }
        if (order.status === 'paid') { res.status(409).json({ message: 'El pago ya fue confirmado; no se canceló el pedido.' }); return; }
        if (order.status !== 'pending') { res.json({ status: order.status }); return; }

        const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
        if (session.status === 'complete') { res.status(409).json({ message: 'El pago ya fue enviado y está en proceso de confirmación.' }); return; }
        if (session.status === 'open') await stripe.checkout.sessions.expire(session.id);

        const expired = await Order.findOneAndUpdate({ _id: order._id, status: 'pending' }, { $set: { status: 'cancelled' } }, { new: true });
        if (expired) await releaseOrderReservations(expired);
        res.json({ status: expired ? 'cancelled' : (await Order.findById(order._id).select('status'))?.status || 'cancelled' });
    } catch (error: unknown) {
        console.error('Unable to cancel Stripe Checkout reservation:', error);
        res.status(502).json({ message: 'No pudimos liberar la reserva ahora. Se liberará automáticamente al vencer el checkout.' });
    }
};

export const getCheckoutConfirmation = async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId;
    const token: unknown = req.query.token;
    if (typeof sessionId !== 'string' || sessionId.length > 200 || typeof token !== 'string' || token.length !== 43) { res.status(400).json({ message: 'Sesión de pago inválida.' }); return; }
    try {
        const order = await Order.findOne({ stripeSessionId: sessionId, confirmationToken: token }).select('status receipt');
        if (!order) { res.status(404).json({ message: 'No se encontró el pedido.' }); return; }
        res.json({ status: order.status, receipt: order.status === 'paid' ? order.receipt : undefined });
    } catch {
        res.status(404).json({ message: 'No se encontró la sesión de pago.' });
    }
};

export const stripeWebhook = async (req: Request, res: Response) => {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = req.header('stripe-signature');
    if (!stripe || !webhookSecret || !signature || !Buffer.isBuffer(req.body)) { res.status(400).send('Webhook configuration or signature invalid.'); return; }
    let event: Stripe.Event;
    try { event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret); }
    catch (error: unknown) { res.status(400).send(`Webhook signature verification failed: ${error instanceof Error ? error.message : 'invalid signature'}`); return; }

    try {
        if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
            const session = event.data.object as Stripe.Checkout.Session;
            if (session.payment_status !== 'paid') { res.json({ received: true }); return; }
            const order = await Order.findOne({ _id: session.metadata?.orderId, stripeSessionId: session.id });
            if (!order) { res.status(404).send('Order not found.'); return; }
            if (order.status === 'pending') {
                const updated = await Order.findOneAndUpdate({ _id: order._id, status: 'pending' }, {
                    $set: { status: 'paid', paidAt: new Date(), stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined }
                }, { new: true });
                if (updated) Object.assign(order, updated.toObject());
                else Object.assign(order, (await Order.findById(order._id))?.toObject() || {});
            }
            if (order.status === 'paid') await createPaidOrderEffects(order, session);
        } else if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const order = await Order.findOne({ _id: session.metadata?.orderId, stripeSessionId: session.id });
            if (order && order.status === 'pending') {
                const result = await Order.updateOne({ _id: order._id, status: 'pending' }, { $set: { status: event.type === 'checkout.session.expired' ? 'expired' : 'failed' } });
                if (result.modifiedCount === 1) await releaseOrderReservations(order);
            }
        }
        res.json({ received: true });
    } catch (error: unknown) {
        console.error('Stripe webhook processing failed:', error);
        res.status(500).send('Webhook processing failed; Stripe may retry this event.');
    }
};

// Recover reservations if the API was offline when Stripe emitted its expiration webhook.
// Completed/paid sessions remain pending for their success webhook to finalize.
export const expireOverdueCheckouts = async (): Promise<void> => {
    const stripe = getStripe();
    if (!stripe) return;
    const overdue = await Order.find({ status: { $in: ['pending', 'cancelled', 'expired', 'failed'] }, expiresAt: { $lte: new Date() } }).sort({ expiresAt: 1 }).limit(100);
    for (const order of overdue) {
        if (order.status !== 'pending') {
            await releaseOrderReservations(order);
            continue;
        }
        if (order.stripeSessionId) {
            const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
            if (session.status === 'complete' && session.payment_status === 'paid') continue;
            if (session.status === 'open') await stripe.checkout.sessions.expire(session.id);
        }
        const expired = await Order.findOneAndUpdate({ _id: order._id, status: 'pending' }, { $set: { status: 'expired' } }, { new: true });
        if (expired) await releaseOrderReservations(expired);
    }
};

export const listOrders = async (_req: Request, res: Response) => {
    try { res.json(await Order.find().sort({ createdAt: -1 }).limit(500).lean()); }
    catch (error: unknown) { console.error(error); res.status(500).json({ message: 'No se pudieron cargar los pedidos.' }); }
};
