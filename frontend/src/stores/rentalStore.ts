import { defineStore } from 'pinia';
import api from '../services/api';

export const useRentalStore = defineStore('rental', {
    state: () => ({
        rentals: [] as any[],
        loading: false,
        error: null as string | null,
    }),
    actions: {
        async fetchRentals() {
            this.loading = true;
            try {
                const response = await api.get('/rentals');
                this.rentals = response.data;
            } catch (err: any) {
                this.error = err.message || 'Error fetching rentals';
            } finally {
                this.loading = false;
            }
        },
        async createRental(rentalData: any) {
            this.loading = true;
            try {
                const response = await api.post('/rentals', rentalData);
                this.rentals.unshift(response.data);
                // Refresh to get populated data or manually populate if complex
                await this.fetchRentals();
            } catch (err: any) {
                this.error = err.response?.data?.message || err.message || 'Error creating rental';
                throw err; // Re-throw to handle in component
            } finally {
                this.loading = false;
            }
        },
        async returnRental(id: string) {
            this.loading = true;
            try {
                const response = await api.put(`/rentals/${id}/return`);
                const index = this.rentals.findIndex(r => r._id === id);
                if (index !== -1) {
                    this.rentals[index] = response.data;
                    // Refresh to ensure consistency
                    await this.fetchRentals();
                }
            } catch (err: any) {
                this.error = err.message || 'Error returning rental';
            } finally {
                this.loading = false;
            }
        },
        async togglePayment(id: string) {
            try {
                const response = await api.put(`/rentals/${id}/payment`);
                const index = this.rentals.findIndex(r => r._id === id);
                if (index !== -1) {
                    this.rentals[index] = response.data;
                    // Refresh to ensure consistency
                    await this.fetchRentals();
                }
            } catch (err: any) {
                this.error = err.message || 'Error updating payment status';
            }
        }
    }
});
