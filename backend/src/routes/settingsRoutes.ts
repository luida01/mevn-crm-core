import { Router } from 'express';
import mongoose from 'mongoose';
import BusinessSettings, { defaultSettings, readBusinessSettings } from '../models/BusinessSettings';
import { requireAuth, requireRole } from '../middleware/auth';
import { pickRequestFields } from '../utils/requestBody';

const router = Router();
router.use(requireAuth, requireRole('admin'));
router.get('/', async (_req, res) => {
    try { res.json(await readBusinessSettings()); }
    catch (error: unknown) { console.error(error); res.status(500).json({ message: 'No se pudo cargar la configuración.' }); }
});
router.put('/', async (req, res) => {
    const data = pickRequestFields<typeof defaultSettings>(req.body, ['businessName', 'contactEmail', 'phone', 'address', 'defaultRentalDays']);
    if (!data || Object.entries(data).some(([key, value]) => key === 'defaultRentalDays'
        ? typeof value !== 'number' || !Number.isInteger(value)
        : typeof value !== 'string')) {
        res.status(400).json({ message: 'Configuración inválida.' }); return;
    }
    try {
        const settings = await BusinessSettings.findOneAndUpdate(
            { _id: 'business' }, { $set: data, $setOnInsert: Object.fromEntries(Object.entries(defaultSettings).filter(([key]) => !(key in data))) },
            { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );
        res.json(settings);
    } catch (error: unknown) {
        if (error instanceof mongoose.Error.ValidationError) { res.status(400).json({ message: error.message }); return; }
        console.error(error); res.status(500).json({ message: 'No se pudo guardar la configuración.' });
    }
});
export default router;
