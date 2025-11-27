export interface Customer {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    status: 'prospect' | 'lead' | 'negotiation' | 'closed';
    notes?: string;
    createdAt: string;
}

export type CustomerInput = Omit<Customer, '_id' | 'createdAt'>;
