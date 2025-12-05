import mongoose, { Schema, Document } from 'mongoose';

export interface IRental extends Document {
    customer: mongoose.Types.ObjectId;
    manga: mongoose.Types.ObjectId;
    startDate: Date;
    dueDate: Date;
    returnDate?: Date;
    status: 'ACTIVE' | 'RETURNED' | 'LATE';
    cost: number;
    isPaid: boolean;
}

const RentalSchema: Schema = new Schema({
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    manga: { type: Schema.Types.ObjectId, ref: 'Manga', required: true },
    startDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    status: {
        type: String,
        enum: ['ACTIVE', 'RETURNED', 'LATE'],
        default: 'ACTIVE'
    },
    cost: { type: Number, required: true },
    isPaid: { type: Boolean, default: false }
});

export default mongoose.model<IRental>('Rental', RentalSchema);
