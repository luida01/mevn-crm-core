import mongoose, { Document, Schema } from 'mongoose';

export interface IMangaSeries extends Document {
    seriesKey: string;
    title: string;
    author: string;
    genre: string;
    description?: string;
    publishedYear?: number;
    status?: string;
    malScore?: number;
    malId?: string;
    mangaDexId?: string;
    alternativeTitles: string[];
    authorAliases: string[];
    createdAt: Date;
    updatedAt: Date;
}

const MangaSeriesSchema = new Schema<IMangaSeries>({
    seriesKey: { type: String, required: true, unique: true, trim: true, maxlength: 240 },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    author: { type: String, required: true, trim: true, maxlength: 200 },
    genre: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 10000 },
    publishedYear: { type: Number, min: 1800, max: 2200 },
    status: { type: String },
    malScore: { type: Number, min: 0, max: 10 },
    malId: { type: String, trim: true },
    mangaDexId: { type: String, trim: true, maxlength: 36 },
    alternativeTitles: { type: [String], default: [] },
    authorAliases: { type: [String], default: [] }
}, { timestamps: true });

MangaSeriesSchema.index({ title: 'text', author: 'text', genre: 'text', alternativeTitles: 'text' });
MangaSeriesSchema.index({ malId: 1 }, { sparse: true });
MangaSeriesSchema.index({ mangaDexId: 1 }, { sparse: true });

export default mongoose.model<IMangaSeries>('MangaSeries', MangaSeriesSchema);
