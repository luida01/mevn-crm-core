import { Router } from 'express';
import mongoose from 'mongoose';
import Invoice from '../models/Invoice';
import Rental from '../models/Rental';
import Customer from '../models/Customer';
import Manga from '../models/Manga';
import { readBusinessSettings } from '../models/BusinessSettings';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
router.use(requireAuth, requireRole('admin'));
const paymentFields = 'isPaid paidAt status';
router.get('/', async (_req, res) => {
    try { res.json(await Invoice.find().sort({ issuedAt: -1 }).populate('rental', paymentFields)); }
    catch (error: unknown) { console.error(error); res.status(500).json({ message: 'No se pudieron cargar los comprobantes.' }); }
});
router.post('/', async (req, res) => {
    const rentalId: unknown = req.body?.rentalId;
    if (typeof rentalId !== 'string' || !mongoose.isValidObjectId(rentalId)) {
        res.status(400).json({ message: 'Selecciona un alquiler válido.' }); return;
    }
    try {
        await Invoice.init();
        const existing = await Invoice.findOne({ rental: rentalId }).populate('rental', paymentFields);
        if (existing) { res.json(existing); return; }
        const rental = await Rental.findById(rentalId);
        if (!rental) { res.status(404).json({ message: 'El alquiler no existe.' }); return; }
        const [customer, manga, settings] = await Promise.all([
            Customer.findById(rental.customer), Manga.findById(rental.manga), readBusinessSettings()
        ]);
        if (!customer || !manga) { res.status(409).json({ message: 'Faltan los datos del cliente o del manga.' }); return; }
        const invoice = await Invoice.create({
            number: 'MG-' + rentalId.toUpperCase(),
            rental: rental._id,
            issuer: { businessName: settings.businessName, contactEmail: settings.contactEmail, phone: settings.phone, address: settings.address },
            customer: { name: customer.firstName + ' ' + customer.lastName, email: customer.email,
                address: [customer.address?.street, customer.address?.city, customer.address?.zip].filter(Boolean).join(', ') },
            item: { title: manga.title, volume: manga.volume, startDate: rental.startDate, dueDate: rental.dueDate },
            amount: rental.cost
        });
        res.status(201).json(await invoice.populate('rental', paymentFields));
    } catch (error: unknown) {
        // A second simultaneous request must reuse the same document.
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
            res.json(await Invoice.findOne({ rental: rentalId }).populate('rental', paymentFields)); return;
        }
        console.error(error); res.status(500).json({ message: 'No se pudo emitir el comprobante.' });
    }
});
export default router;
