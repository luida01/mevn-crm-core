import { defineStore } from 'pinia';
import api from '../services/api';
import type { Customer, CustomerInput } from '../types/Customer';

export const useCustomerStore = defineStore('customer', {
    state: () => ({
        customers: [] as Customer[],
        currentCustomer: null as Customer | null,
        loading: false,
        error: null as string | null,
        searchQuery: '',
        statusFilter: 'all' as 'all' | 'renting' | 'overdue' | 'not-renting',
    }),
    getters: {
        filteredCustomers: (state) => {
            let result = state.customers;

            // Filter by search query
            if (state.searchQuery) {
                const query = state.searchQuery.toLowerCase();
                result = result.filter(c =>
                    (c.firstName?.toLowerCase() || '').includes(query) ||
                    (c.lastName?.toLowerCase() || '').includes(query) ||
                    (c.email?.toLowerCase() || '').includes(query)
                );
            }

            // Filter by rental status
            if (state.statusFilter !== 'all') {
                result = result.filter(c => {
                    const hasActiveRental = c.rentals?.some((r: any) => r.status === 'ACTIVE');
                    const hasLateRental = c.rentals?.some((r: any) => r.status === 'LATE');

                    switch (state.statusFilter) {
                        case 'renting':
                            return hasActiveRental && !hasLateRental;
                        case 'overdue':
                            return hasLateRental;
                        case 'not-renting':
                            return !hasActiveRental && !hasLateRental;
                        default:
                            return true;
                    }
                });
            }

            return result;
        }
    },
    actions: {
        async fetchCustomers() {
            this.loading = true;
            try {
                const response = await api.get('/customers');
                this.customers = response.data;
            } catch (err: any) {
                this.error = err.message || 'Error fetching customers';
            } finally {
                this.loading = false;
            }
        },
        async createCustomer(customer: CustomerInput) {
            this.loading = true;
            try {
                const response = await api.post('/customers', customer);
                this.customers.unshift(response.data);
            } catch (err: any) {
                this.error = err.message || 'Error creating customer';
            } finally {
                this.loading = false;
            }
        },
        async updateCustomer(id: string, updates: Partial<CustomerInput>) {
            this.loading = true;
            try {
                const response = await api.put(`/customers/${id}`, updates);
                const index = this.customers.findIndex(c => c._id === id);
                if (index !== -1) {
                    this.customers[index] = response.data;
                }
            } catch (err: any) {
                this.error = err.message || 'Error updating customer';
            } finally {
                this.loading = false;
            }
        },
        async deleteCustomer(id: string) {
            try {
                await api.delete(`/customers/${id}`);
                this.customers = this.customers.filter(c => c._id !== id);
            } catch (err: any) {
                this.error = err.message || 'Error deleting customer';
            }
        }
    },
});
