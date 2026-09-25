import { defineStore } from 'pinia';
import api from '../services/api';
import { errorMessage } from '../services/errors';
import type { Rental, RentalInput } from '../types/Rental';

export const useRentalStore = defineStore('rental', {
    state: () => ({ rentals: [] as Rental[], loading: false, busy: '', error: null as string | null }),
    actions: {
        async fetchRentals() {
            this.loading = true; this.error = null;
            try { this.rentals = (await api.get<Rental[]>('/rentals')).data; return true; }
            catch (error: unknown) { this.error = errorMessage(error); return false; }
            finally { this.loading = false; }
        },
        async createRental(input: RentalInput) {
            if (this.busy) return false;
            this.busy = 'create'; this.error = null;
            try { await api.post('/rentals', input); await this.fetchRentals(); return true; }
            catch (error: unknown) { this.error = errorMessage(error); return false; }
            finally { this.busy = ''; }
        },
        async returnRental(id: string) {
            if (this.busy) return false;
            this.busy = id; this.error = null;
            try { await api.put('/rentals/' + id + '/return'); await this.fetchRentals(); return true; }
            catch (error: unknown) { this.error = errorMessage(error); return false; }
            finally { this.busy = ''; }
        },
        async setPayment(id: string, isPaid: boolean) {
            if (this.busy) return false;
            this.busy = id; this.error = null;
            try { await api.put('/rentals/' + id + '/payment', { isPaid }); await this.fetchRentals(); return true; }
            catch (error: unknown) { this.error = errorMessage(error); return false; }
            finally { this.busy = ''; }
        }
    }
});
