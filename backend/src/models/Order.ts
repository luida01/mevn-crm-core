import mongoose, { Document, Schema, Types } from 'mongoose';

export type OrderKind = 'purchase' | 'rental';
export type OrderStatus = 'pending' | 'paid' | 'expired' | 'cancelled' | 'failed';

export interface IOrderItem {
    manga: Types.ObjectId;
    title: string;
    author: string;
    volume: number;
    coverImage?: string;
    kind: OrderKind;
    quantity: number;
    days?: number;
    unitAmount: number;
    lineTotal: number;
}

export interface IOrder extends Document {
    idempotencyKey: string;
    status: OrderStatus;
    currency: string;
    items: IOrderItem[];
    total: number;
    customer: { name: string; email: string };
    stripeSessionId?: string;
    confirmationToken: string;
    stripePaymentIntentId?: string;
    expiresAt: Date;
    paidAt?: Date;
    receipt?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
    idempotencyKey: { type: String, required: true, unique: true, maxlength: 120 },
    status: { type: String, enum: ['pending', 'paid', 'expired', 'cancelled', 'failed'], required: true, default: 'pending', index: true },
    currency: { type: String, required: true, minlength: 3, maxlength: 3 },
    items: [{
        manga: { type: Schema.Types.ObjectId, ref: 'Manga', required: true },
        title: { type: String, required: true }, author: { type: String, required: true }, volume: { type: Number, required: true },
        coverImage: String,
        kind: { type: String, enum: ['purchase', 'rental'], required: true },
        quantity: { type: Number, required: true, min: 1 }, days: { type: Number, min: 1, max: 30 },
        unitAmount: { type: Number, required: true, min: 0 }, lineTotal: { type: Number, required: true, min: 0 }
    }],
    total: { type: Number, required: true, min: 0 },
    customer: { name: { type: String, required: true }, email: { type: String, required: true, lowercase: true } },
    stripeSessionId: { type: String, sparse: true, unique: true },
    confirmationToken: { type: String, required: true, unique: true, select: false, maxlength: 64 },
    stripePaymentIntentId: String,
    expiresAt: { type: Date, required: true }, paidAt: Date,
    receipt: { type: Schema.Types.Mixed }
}, { timestamps: true });

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
