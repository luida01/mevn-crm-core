import axios from 'axios';

const messages: Record<string, string> = {
    'A customer with this email already exists': 'Ya existe un cliente con ese correo.',
    'Cannot delete a customer with rental history': 'Este cliente tiene historial de alquileres. Puedes desactivarlo desde Editar.',
    'Customer is inactive': 'El cliente está inactivo. Actívalo antes de registrar un alquiler.',
    'Manga is out of stock': 'Este volumen se quedó sin stock. Actualiza la lista.',
    'Rental already returned': 'Este alquiler ya fue devuelto.',
    'dueDate must be a valid future date': 'La devolución debe ser posterior a la fecha y hora actuales.'
};
export function errorMessage(error: unknown): string {
    const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error ? error.message : 'No se pudo completar la operación.';
    return messages[message] || message;
}

