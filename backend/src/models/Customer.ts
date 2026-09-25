import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    isActive: boolean;
    address: {
        street: string;
        city: string;
        zip: string;
    };
    createdAt: Date;
}

const CustomerSchema: Schema = new Schema({
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 40 },
    isActive: { type: Boolean, default: true },
    address: {
        street: { type: String },
        city: { type: String },
        zip: { type: String }
    },
    createdAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for rentals
CustomerSchema.virtual('rentals', {
    ref: 'Rental',
    localField: '_id',
    foreignField: 'customer'
});

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
