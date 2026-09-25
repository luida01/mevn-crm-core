export interface Rental {
    _id: string;
    customer: { _id: string; firstName: string; lastName: string; email: string } | null;
    manga: { _id: string; title: string; volume: number; coverImage?: string } | null;
    startDate: string;
    dueDate: string;
    returnDate?: string;
    status: 'ACTIVE' | 'LATE' | 'RETURNED';
    cost: number;
    isPaid: boolean;
    paidAt?: string;
}
export interface RentalInput { customerId: string; mangaId: string; dueDate: string; isPaid: boolean }

