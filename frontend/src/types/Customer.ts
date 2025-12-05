export interface Customer {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    phone?: string;
    isActive: boolean;
    address: {
        street: string;
        city: string;
        zip: string;
    };
    rentals?: any[]; // Using any for now to avoid circular dependency with Manga type, or define Rental type
    createdAt: string;
}

export type CustomerInput = Omit<Customer, '_id' | 'createdAt'>;
