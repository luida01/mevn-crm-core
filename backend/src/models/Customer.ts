import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    status: 'prospect' | 'lead' | 'negotiation' | 'closed';
    notes?: string;
    createdAt: Date;
}

const CustomerSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    company: { type: String },
    status: {
        type: String,
        enum: ['prospect', 'lead', 'negotiation', 'closed'],
        default: 'prospect'
    },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
