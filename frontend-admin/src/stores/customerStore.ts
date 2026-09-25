import { defineStore } from 'pinia';
import api from '../services/api';
import { errorMessage } from '../services/errors';
import type { Customer, CustomerInput } from '../types/Customer';

export const useCustomerStore = defineStore('customer', {
    state: () => ({
        customers: [] as Customer[], loading: false, saving: false, error: null as string | null,
        searchQuery: '', statusFilter: 'all' as 'all' | 'renting' | 'overdue' | 'not-renting' | 'inactive'
    }),
    getters: {
        filteredCustomers: state => state.customers.filter(customer => {
            const query = state.searchQuery.trim().toLocaleLowerCase();
            if (query && ![customer.firstName, customer.lastName, customer.email, customer.phone].some(value => value?.toLocaleLowerCase().includes(query))) return false;
            const active = customer.rentals?.some(r => r.status !== 'RETURNED');
            const late = customer.rentals?.some(r => r.status !== 'RETURNED' && new Date(r.dueDate).getTime() < Date.now());
            switch (state.statusFilter) {
                case 'renting': return active;
                case 'overdue': return late;
                case 'not-renting': return !active;
                case 'inactive': return !customer.isActive;
                default: return true;
            }
        })
    },
    actions: {
        async fetchCustomers() {
            this.loading = true; this.error = null;
            try { this.customers = (await api.get<Customer[]>('/customers')).data; return true; }
            catch (error: unknown) { this.error = errorMessage(error); return false; }
            finally { this.loading = false; }
        },
        async saveCustomer(customer: CustomerInput, id?: string) {
            if (this.saving) return false;
            this.saving = true; this.error = null;
            try {
                const saved = id ? (await api.put<Customer>('/customers/' + id, customer)).data : (await api.post<Customer>('/customers', customer)).data;
                const index = this.customers.findIndex(item => item._id === saved._id);
                if (index < 0) this.customers.unshift(saved); else this.customers[index] = saved;
                return true;
            } catch (error: unknown) { this.error = errorMessage(error); return false; }
            finally { this.saving = false; }
        },
        async deleteCustomer(id: string) {
            if (this.saving) return false;
            this.saving = true; this.error = null;
            try { await api.delete('/customers/' + id); this.customers = this.customers.filter(c => c._id !== id); return true; }
            catch (error: unknown) { this.error = errorMessage(error); return false; }
            finally { this.saving = false; }
        }
    }
});
