import { Schema, model } from 'mongoose';

export const defaultSettings = {
    businessName: 'MangaGo',
    contactEmail: '',
    phone: '',
    address: '',
    defaultRentalDays: 7
};

const schema = new Schema({
    _id: { type: String, default: 'business' },
    businessName: { type: String, required: true, trim: true, maxlength: 120 },
    contactEmail: { type: String, trim: true, lowercase: true, maxlength: 254, match: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    phone: { type: String, trim: true, maxlength: 40 },
    address: { type: String, trim: true, maxlength: 300 },
    defaultRentalDays: { type: Number, min: 1, max: 90, validate: Number.isInteger }
}, { timestamps: true });

const BusinessSettings = model('BusinessSettings', schema);
export const readBusinessSettings = async () => (await BusinessSettings.findById('business').lean()) ?? defaultSettings;
export default BusinessSettings;

