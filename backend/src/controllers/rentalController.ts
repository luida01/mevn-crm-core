import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Rental from '../models/Rental';
import Customer from '../models/Customer';
import Manga from '../models/Manga';
import { getErrorMessage } from '../utils/requestBody';
import { refreshOverdueRentals } from '../services/rentalStatus';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const getRentals = async (_req: Request, res: Response) => {
    try {
        await refreshOverdueRentals();

        const rentals = await Rental.find()
            .populate('customer', 'firstName lastName email')
            .populate('manga', 'title volume coverImage')
            .sort({ createdAt: -1 });
        res.json(rentals);
    } catch (error: unknown) {
        console.error('Error fetching rentals:', error);
        res.status(500).json({ message: 'Error fetching rentals' });
    }
};

export const createRental = async (req: Request, res: Response) => {
    const body: unknown = req.body;
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        res.status(400).json({ message: 'A rental object is required' });
        return;
    }

    const input = body as Record<string, unknown>;
    const { customerId, mangaId, dueDate, isPaid } = input;

    if (typeof customerId !== 'string' || !mongoose.isValidObjectId(customerId)
        || typeof mangaId !== 'string' || !mongoose.isValidObjectId(mangaId)) {
        res.status(400).json({ message: 'Valid customerId and mangaId are required' });
        return;
    }

    if (typeof dueDate !== 'string' && !(dueDate instanceof Date)) {
        res.status(400).json({ message: 'A valid dueDate is required' });
        return;
    }

    const parsedDueDate = new Date(dueDate);
    if (Number.isNaN(parsedDueDate.getTime()) || parsedDueDate <= new Date()) {
        res.status(400).json({ message: 'dueDate must be a valid future date' });
        return;
    }

    if (isPaid !== undefined && typeof isPaid !== 'boolean') {
        res.status(400).json({ message: 'isPaid must be a boolean' });
        return;
    }

    let stockReserved = false;
    try {
        const customer = await Customer.findOne({ _id: customerId, isActive: true }).select('_id');
        if (!customer) {
            const customerExists = await Customer.exists({ _id: customerId });
            res.status(customerExists ? 409 : 404).json({
                message: customerExists ? 'Customer is inactive' : 'Customer not found'
            });
            return;
        }

        const manga = await Manga.findOneAndUpdate(
            { _id: mangaId, stock: { $gt: 0 } },
            { $inc: { stock: -1 } },
            { new: true }
        );
        if (!manga) {
            const mangaExists = await Manga.exists({ _id: mangaId });
            res.status(mangaExists ? 409 : 404).json({
                message: mangaExists ? 'Manga is out of stock' : 'Manga not found'
            });
            return;
        }
        stockReserved = true;

        const rentalDays = Math.max(1, Math.ceil((parsedDueDate.getTime() - Date.now()) / DAY_IN_MS));
        const rental = await Rental.create({
            customer: customerId,
            manga: mangaId,
            dueDate: parsedDueDate,
            cost: Math.round(manga.rentalPrice * rentalDays * 100) / 100,
            isPaid: isPaid === true,
            paidAt: isPaid === true ? new Date() : undefined
        });

        res.status(201).json(rental);
    } catch (error: unknown) {
        if (stockReserved) {
            try {
                await Manga.updateOne({ _id: mangaId }, { $inc: { stock: 1 } });
            } catch (rollbackError: unknown) {
                console.error('Failed to restore stock after rental creation failed:', rollbackError);
            }
        }

        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).json({ message: error.message });
            return;
        }

        console.error('Error creating rental:', error);
        res.status(500).json({ message: 'Error creating rental' });
    }
};

export const returnRental = async (req: Request, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).json({ message: 'Invalid rental id' });
        return;
    }

    try {
        const currentRental = await Rental.findById(req.params.id);
        if (!currentRental) {
            res.status(404).json({ message: 'Rental not found' });
            return;
        }
        if (currentRental.status === 'RETURNED') {
            res.status(409).json({ message: 'Rental already returned' });
            return;
        }

        const returnedAt = new Date();
        const rental = await Rental.findOneAndUpdate(
            { _id: currentRental._id, status: currentRental.status },
            { $set: { status: 'RETURNED', returnDate: returnedAt } },
            { new: true, runValidators: true }
        );
        if (!rental) {
            res.status(409).json({ message: 'Rental status changed; refresh and try again' });
            return;
        }

        try {
            const stockUpdate = await Manga.updateOne({ _id: rental.manga }, { $inc: { stock: 1 } });
            if (stockUpdate.matchedCount === 0) {
                throw new Error('The manga inventory item no longer exists');
            }
        } catch (stockError: unknown) {
            await Rental.updateOne(
                { _id: rental._id, status: 'RETURNED', returnDate: returnedAt },
                { $set: { status: currentRental.status }, $unset: { returnDate: 1 } }
            );
            console.error('Error restoring stock on rental return:', stockError);
            res.status(409).json({ message: 'Could not restore stock; rental return was rolled back' });
            return;
        }

        res.json(rental);
    } catch (error: unknown) {
        console.error('Error returning rental:', error);
        res.status(500).json({ message: 'Error returning rental' });
    }
};

export const togglePayment = async (req: Request, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).json({ message: 'Invalid rental id' });
        return;
    }

    const requestedState: unknown = req.body?.isPaid;
    if (requestedState !== undefined && typeof requestedState !== 'boolean') {
        res.status(400).json({ message: 'isPaid must be a boolean' });
        return;
    }
    try {
        const currentRental = await Rental.findById(req.params.id).select('isPaid');
        if (!currentRental) {
            res.status(404).json({ message: 'Rental not found' });
            return;
        }

        const nextState = typeof requestedState === 'boolean' ? requestedState : !currentRental.isPaid;
        if (nextState === currentRental.isPaid) {
            res.json(await Rental.findById(req.params.id));
            return;
        }
        const rental = await Rental.findOneAndUpdate(
            { _id: req.params.id, isPaid: currentRental.isPaid },
            nextState ? { $set: { isPaid: true, paidAt: new Date() } } : { $set: { isPaid: false }, $unset: { paidAt: 1 } },
            { new: true }
        );
        if (!rental) {
            res.status(409).json({ message: 'Payment status changed; refresh and try again' });
            return;
        }
        res.json(rental);
    } catch (error: unknown) {
        console.error(getErrorMessage(error));
        res.status(500).json({ message: 'Error updating payment status' });
    }
};
