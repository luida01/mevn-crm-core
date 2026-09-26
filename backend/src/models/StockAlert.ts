import { randomUUID } from 'node:crypto';
import { Schema, model } from 'mongoose';

const stockAlertSchema = new Schema({
    manga: { type: Schema.Types.ObjectId, ref: 'Manga', required: true },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    locale: { type: String, enum: ['es', 'en'], default: 'es', required: true },
    status: { type: String, enum: ['pending', 'active', 'notified', 'cancelled'], default: 'pending', required: true },
    generation: { type: String, default: randomUUID, required: true },
    confirmationSentAt: Date,
    notifiedAt: Date,
    nextAttemptAt: { type: Date, default: Date.now, required: true },
    lockedUntil: { type: Date, default: () => new Date(0), required: true },
    attempts: { type: Number, default: 0, required: true },
    lastError: String,
    expiresAt: { type: Date, required: true },
    requestedAt: { type: Date, default: Date.now, required: true }
}, { timestamps: true });

stockAlertSchema.index({ manga: 1, email: 1 }, { unique: true });
stockAlertSchema.index({ status: 1, nextAttemptAt: 1, lockedUntil: 1 });
stockAlertSchema.index({ email: 1, requestedAt: -1 });
stockAlertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model('StockAlert', stockAlertSchema);
