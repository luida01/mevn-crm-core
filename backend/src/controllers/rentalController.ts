import { Request, Response } from 'express';
import Rental from '../models/Rental';
import Customer from '../models/Customer';
import Manga from '../models/Manga';

// Get all rentals
export const getRentals = async (req: Request, res: Response) => {
    try {
        const rentals = await Rental.find()
            .populate('customer', 'firstName lastName email')
            .populate('manga', 'title volume coverImage')
            .sort({ createdAt: -1 });
        res.json(rentals);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rentals', error });
    }
};

// Create rental
export const createRental = async (req: Request, res: Response) => {
    try {
        const { customerId, mangaId, dueDate, isPaid } = req.body;

        const customer = await Customer.findById(customerId);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        const manga = await Manga.findById(mangaId);
        if (!manga) return res.status(404).json({ message: 'Manga not found' });

        if (manga.stock <= 0) {
            return res.status(400).json({ message: 'Manga is out of stock' });
        }

        const rental = new Rental({
            customer: customerId,
            manga: mangaId,
            dueDate,
            cost: manga.rentalPrice,
            isPaid: isPaid || false
        });

        await rental.save();

        // Decrease stock
        manga.stock -= 1;
        await manga.save();

        res.status(201).json(rental);
    } catch (error) {
        res.status(400).json({ message: 'Error creating rental', error });
    }
};

// Return rental
export const returnRental = async (req: Request, res: Response) => {
    try {
        const rental = await Rental.findById(req.params.id);
        if (!rental) return res.status(404).json({ message: 'Rental not found' });

        if (rental.status === 'RETURNED') {
            return res.status(400).json({ message: 'Rental already returned' });
        }

        rental.status = 'RETURNED';
        rental.returnDate = new Date();
        await rental.save();

        // Increase stock
        const manga = await Manga.findById(rental.manga);
        if (manga) {
            manga.stock += 1;
            await manga.save();
        }

        res.json(rental);
    } catch (error) {
        res.status(500).json({ message: 'Error returning rental', error });
    }
};

// Toggle payment status
export const togglePayment = async (req: Request, res: Response) => {
    try {
        const rental = await Rental.findById(req.params.id);
        if (!rental) return res.status(404).json({ message: 'Rental not found' });

        rental.isPaid = !rental.isPaid;
        await rental.save();

        res.json(rental);
    } catch (error) {
        res.status(500).json({ message: 'Error updating payment status', error });
    }
};
