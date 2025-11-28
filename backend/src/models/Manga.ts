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
    createdAt: Date;
}

const MangaSchema: Schema = new Schema({
    title: { type: String, required: true },
    volume: { type: Number, required: true, default: 1 },
    author: { type: String, required: true },
    genre: { type: String, required: true },
    isbn: { type: String },
    price: { type: Number, required: true },
    rentalPrice: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    coverImage: { type: String },
    description: { type: String },
    publishedYear: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

// Index for search (we will use Atlas Search later, but basic text index helps for now)
MangaSchema.index({ title: 'text', author: 'text', genre: 'text' });

export default mongoose.model<IManga>('Manga', MangaSchema);
