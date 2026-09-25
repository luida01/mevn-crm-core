import mongoose, { Document, Schema, Types } from 'mongoose';
import type { IMangaSeries } from './MangaSeries';

export interface IManga extends Document {
    series: Types.ObjectId | IMangaSeries;
    volume: number;
    isbn?: string;
    coverImage?: string;
    price: number;
    rentalPrice: number;
    stock: number;
    createdAt: Date;
}

const MangaSchema = new Schema<IManga>({
    series: { type: Schema.Types.ObjectId, ref: 'MangaSeries', required: true, index: true },
    volume: { type: Number, required: true, default: 1, min: 1 },
    isbn: { type: String, trim: true, maxlength: 32 },
    coverImage: { type: String, maxlength: 2048 },
    price: { type: Number, required: true, min: 0 },
    rentalPrice: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0, validate: Number.isInteger },
    createdAt: { type: Date, default: Date.now }
});

MangaSchema.set('toJSON', {
    transform: (_document, ret) => {
        const output = ret as unknown as Record<string, unknown>;
        const reference = output.series;
        if (!reference || typeof reference !== 'object' || !('_id' in reference)) return output;
        const series = reference as Record<string, unknown>;
        const volumeId = output._id;
        Object.assign(output, series, output);
        output._id = volumeId;
        output.seriesId = series._id;
        output.series = series._id;
        return output;
    }
});

MangaSchema.index({ series: 1, volume: 1 });

export default mongoose.model<IManga>('Manga', MangaSchema);
