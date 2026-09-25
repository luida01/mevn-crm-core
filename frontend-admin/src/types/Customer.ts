import type { Rental } from './Rental';
export interface Customer {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    isActive: boolean;
    address: { street: string; city: string; zip: string };
    rentals?: Array<Omit<Rental, 'customer'> & { customer: string }>;
    createdAt: string;
}
export type CustomerInput = Pick<Customer, 'firstName' | 'lastName' | 'email' | 'phone' | 'isActive' | 'address'>;
