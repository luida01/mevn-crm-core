import mongoose, { Schema, Document } from 'mongoose';

export interface IManga extends Document {
    title: string;
    volume: number;
    author: string;
    genre: string;
    isbn?: string;
    price: number; // Sale price
    rentalPrice: number; // Rental price per day/week
    stock: number;
    coverImage?: string;
    description?: string;
    publishedYear?: number;
    status?: string; // Publication status: "Finished", "Publishing", etc.
    malScore?: number; // MAL score (0-10)
    malId?: string; // MAL ID for reference
    createdAt: Date;
}

const MangaSchema: Schema = new Schema({
    title: { type: String, required: true, trim: true, maxlength: 200 },
    volume: { type: Number, required: true, default: 1, min: 1 },
    author: { type: String, required: true, trim: true, maxlength: 200 },
    genre: { type: String, required: true, trim: true, maxlength: 200 },
    isbn: { type: String },
    price: { type: Number, required: true, min: 0 },
    rentalPrice: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    coverImage: { type: String, maxlength: 2048 },
    description: { type: String, maxlength: 10000 },
    publishedYear: { type: Number, min: 1800, max: 2200 },
    status: { type: String }, // Publication status
    malScore: { type: Number, min: 0, max: 10 }, // MAL score
    malId: { type: String }, // MAL ID
    createdAt: { type: Date, default: Date.now }
});

// Index for search (we will use Atlas Search later, but basic text index helps for now)
MangaSchema.index({ title: 'text', author: 'text', genre: 'text' });

export default mongoose.model<IManga>('Manga', MangaSchema);
