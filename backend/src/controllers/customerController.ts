import { Request, Response } from 'express';
import Customer from '../models/Customer';

// Get all customers
export const getCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error });
    }
};

// Get single customer
export const getCustomer = async (req: Request, res: Response) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer', error });
    }
};

// Create customer
export const createCustomer = async (req: Request, res: Response) => {
    try {
        const newCustomer = new Customer(req.body);
        const savedCustomer = await newCustomer.save();
        res.status(201).json(savedCustomer);
    } catch (error) {
        res.status(400).json({ message: 'Error creating customer', error });
    }
};

// Update customer
export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedCustomer) return res.status(404).json({ message: 'Customer not found' });
        res.json(updatedCustomer);
    } catch (error) {
        res.status(400).json({ message: 'Error updating customer', error });
    }
};

// Delete customer
export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
        if (!deletedCustomer) return res.status(404).json({ message: 'Customer not found' });
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting customer', error });
    }
};
