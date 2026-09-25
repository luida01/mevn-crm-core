import Rental from '../models/Rental';

export const refreshOverdueRentals = () => Rental.updateMany(
    { status: 'ACTIVE', dueDate: { $lt: new Date() } },
    { $set: { status: 'LATE' } }
);

