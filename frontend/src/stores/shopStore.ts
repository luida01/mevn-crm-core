import { defineStore } from 'pinia';
import api from '../services/api';
import type { Manga } from '../types/Manga';

export const useShopStore = defineStore('shop', {
    state: () => ({
        topRated: [] as Manga[],
        recentArrivals: [] as Manga[],
        collections: {
            beginner: [] as Manga[],
            animeAdaptations: [] as Manga[],
            horror: [] as Manga[],
            complete: [] as Manga[]
        },
        loading: false,
        error: null as string | null
    }),
    actions: {
        async fetchTopRated(limit: number = 10) {
            this.loading = true;
            try {
                const response = await api.get(`/shop/top-rated?limit=${limit}`);
                this.topRated = response.data;
            } catch (err: any) {
                this.error = err.message || 'Error fetching top-rated mangas';
            } finally {
                this.loading = false;
            }
        },
        async fetchRecentArrivals(limit: number = 12) {
            this.loading = true;
            try {
                const response = await api.get(`/shop/recent?limit=${limit}`);
                this.recentArrivals = response.data;
            } catch (err: any) {
                this.error = err.message || 'Error fetching recent arrivals';
            } finally {
                this.loading = false;
            }
        },
        async fetchCollection(theme: 'beginner' | 'anime-adaptations' | 'horror' | 'complete') {
            this.loading = true;
            try {
                const response = await api.get(`/shop/collections/${theme}`);
                const key = theme === 'anime-adaptations' ? 'animeAdaptations' : theme;
                this.collections[key as keyof typeof this.collections] = response.data;
            } catch (err: any) {
                this.error = err.message || `Error fetching ${theme} collection`;
            } finally {
                this.loading = false;
            }
        },
        async fetchAllCollections() {
            await Promise.all([
                this.fetchCollection('beginner'),
                this.fetchCollection('anime-adaptations'),
                this.fetchCollection('horror'),
                this.fetchCollection('complete')
            ]);
        }
    }
});
