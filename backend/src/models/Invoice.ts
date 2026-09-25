import { Schema, model } from 'mongoose';

const schema = new Schema({
    number: { type: String, required: true, unique: true },
    rental: { type: Schema.Types.ObjectId, ref: 'Rental', required: true, unique: true },
    issuedAt: { type: Date, default: Date.now },
    issuer: {
        businessName: { type: String, required: true },
        contactEmail: String,
        phone: String,
        address: String
    },
    customer: { name: { type: String, required: true }, email: String, address: String },
    item: { title: { type: String, required: true }, volume: Number, startDate: Date, dueDate: Date },
    amount: { type: Number, required: true, min: 0 }
}, { timestamps: true });

export default model('Invoice', schema);

