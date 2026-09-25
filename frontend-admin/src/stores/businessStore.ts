import { defineStore } from 'pinia';
import api from '../services/api';
import { errorMessage } from '../services/errors';
import type { BusinessSettings, Invoice } from '../types/Business';

export const useBusinessStore = defineStore('business', {
    state: () => ({
        settings: { businessName: 'MangaGo', contactEmail: '', phone: '', address: '', defaultRentalDays: 7 } as BusinessSettings,
        invoices: [] as Invoice[],
        error: null as string | null,
        loading: false,
        saving: false
    }),
    actions: {
        async fetchSettings() {
            this.error = null;
            try { this.settings = (await api.get<BusinessSettings>('/settings')).data; return true; }
            catch (error: unknown) { this.error = errorMessage(error); return false; }
        },
        async saveSettings(value: BusinessSettings) {
            if (this.saving) return false;
            this.saving = true; this.error = null;
            try { this.settings = (await api.put<BusinessSettings>('/settings', value)).data; return true; }
            catch (error: unknown) { this.error = errorMessage(error); return false; }
            finally { this.saving = false; }
        },
        async fetchInvoices() {
            this.loading = true; this.error = null;
            try { this.invoices = (await api.get<Invoice[]>('/invoices')).data; }
            catch (error: unknown) { this.error = errorMessage(error); }
            finally { this.loading = false; }
        },
        async issueInvoice(rentalId: string): Promise<Invoice | null> {
            if (this.saving) return null;
            this.saving = true; this.error = null;
            try {
                const invoice = (await api.post<Invoice>('/invoices', { rentalId })).data;
                this.invoices = [invoice, ...this.invoices.filter(item => item._id !== invoice._id)];
                return invoice;
            } catch (error: unknown) { this.error = errorMessage(error); return null; }
            finally { this.saving = false; }
        }
    }
});

