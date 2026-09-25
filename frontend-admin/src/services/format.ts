import type { Rental } from '../types/Rental';

export const money = (value: number) => '$' + value.toFixed(2);
export const date = (value?: string) => value ? new Date(value).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const dateTime = (value?: string) => value ? new Date(value).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
export const rentalStatus = (rental: Rental): Rental['status'] => rental.status !== 'RETURNED' && new Date(rental.dueDate).getTime() < Date.now() ? 'LATE' : rental.status;
export const statusLabel = (status: Rental['status']) => ({ ACTIVE: 'En curso', LATE: 'Vencido', RETURNED: 'Devuelto' })[status];
export const customerName = (rental: Rental) => rental.customer ? rental.customer.firstName + ' ' + rental.customer.lastName : 'Cliente no disponible';

