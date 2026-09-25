export interface BusinessSettings {
    businessName: string;
    contactEmail: string;
    phone: string;
    address: string;
    defaultRentalDays: number;
}
export interface Invoice {
    _id: string;
    number: string;
    issuedAt: string;
    rental: { _id: string; isPaid: boolean; paidAt?: string; status: string } | null;
    issuer: Omit<BusinessSettings, 'defaultRentalDays'>;
    customer: { name: string; email: string; address: string };
    item: { title: string; volume: number; startDate: string; dueDate: string };
    amount: number;
}

