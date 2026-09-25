import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Customer, { ICustomer } from '../models/Customer';
import Rental from '../models/Rental';
import '../models/Manga'; // Register the populated model
import { getErrorMessage, pickRequestFields } from '../utils/requestBody';
import { refreshOverdueRentals } from '../services/rentalStatus';

type CustomerInput = Pick<ICustomer, 'firstName' | 'lastName' | 'email' | 'phone' | 'isActive' | 'address'>;
const customerFields: readonly (keyof CustomerInput)[] = [
    'firstName', 'lastName', 'email', 'phone', 'isActive', 'address'
];

const populateRentals = {
    path: 'rentals',
    populate: { path: 'manga' }
};

const handleWriteError = (error: unknown, res: Response, fallback: string): void => {
    if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json({ message: error.message });
        return;
    }

    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
        res.status(409).json({ message: 'A customer with this email already exists' });
        return;
    }

    console.error(fallback, error);
    res.status(500).json({ message: fallback });
};

export const getCustomers = async (_req: Request, res: Response) => {
    try {
        await refreshOverdueRentals();
        const customers = await Customer.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .populate(populateRentals);
        res.json(customers);
    } catch (error: unknown) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Error fetching customers' });
    }
};

export const getCustomer = async (req: Request, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).json({ message: 'Invalid customer id' });
        return;
    }

    try {
        await refreshOverdueRentals();
        const customer = await Customer.findById(req.params.id)
            .select('-password')
            .populate(populateRentals);
        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        res.json(customer);
    } catch (error: unknown) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ message: 'Error fetching customer' });
    }
};

export const createCustomer = async (req: Request, res: Response) => {
    const customerData = pickRequestFields<CustomerInput>(req.body, customerFields);
    if (!customerData) {
        res.status(400).json({ message: 'A customer object is required' });
        return;
    }

    try {
        const customer = await Customer.create(customerData);
        res.status(201).json(customer);
    } catch (error: unknown) {
        handleWriteError(error, res, 'Error creating customer');
    }
};

export const updateCustomer = async (req: Request, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).json({ message: 'Invalid customer id' });
        return;
    }

    const customerData = pickRequestFields<CustomerInput>(req.body, customerFields);
    if (!customerData) {
        res.status(400).json({ message: 'No supported customer fields were provided' });
        return;
    }

    try {
        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            { $set: customerData },
            { new: true, runValidators: true }
        ).select('-password').populate(populateRentals);

        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        res.json(customer);
    } catch (error: unknown) {
        handleWriteError(error, res, 'Error updating customer');
    }
};

export const deleteCustomer = async (req: Request, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).json({ message: 'Invalid customer id' });
        return;
    }

    try {
        const customerExists = await Customer.exists({ _id: req.params.id });
        if (!customerExists) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }

        if (await Rental.exists({ customer: req.params.id })) {
            res.status(409).json({ message: 'Cannot delete a customer with rental history' });
            return;
        }

        await Customer.deleteOne({ _id: req.params.id });
        res.json({ message: 'Customer deleted successfully' });
    } catch (error: unknown) {
        console.error(getErrorMessage(error));
        res.status(500).json({ message: 'Error deleting customer' });
    }
};
