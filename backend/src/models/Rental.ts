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
    paidAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    checkoutOrder?: mongoose.Types.ObjectId;
    checkoutLineKey?: string;
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
    cost: { type: Number, required: true, min: 0 },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    checkoutOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
    checkoutLineKey: { type: String, maxlength: 100 }
}, { timestamps: true });

RentalSchema.index({ status: 1, dueDate: 1 });
RentalSchema.index({ startDate: -1, manga: 1 });
RentalSchema.index({ checkoutOrder: 1, checkoutLineKey: 1 }, { unique: true, sparse: true });

export default mongoose.model<IRental>('Rental', RentalSchema);
