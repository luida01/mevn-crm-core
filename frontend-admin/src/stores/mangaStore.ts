import { defineStore } from 'pinia';
import api from '../services/api';
import type { Manga, MangaInput } from '../types/Manga';

export const useMangaStore = defineStore('manga', {
    state: () => ({
        mangas: [] as Manga[],
        currentManga: null as Manga | null,
        loading: false,
        error: null as string | null,
        searchQuery: '',
    }),
    getters: {
        filteredMangas: (state) => {
            if (!state.searchQuery) return state.mangas;
            const query = state.searchQuery.toLowerCase();
            return state.mangas.filter(m =>
                m.title.toLowerCase().includes(query) ||
                m.author.toLowerCase().includes(query) ||
                m.genre.toLowerCase().includes(query)
            );
        }
    },
    actions: {
        async fetchMangas() {
            this.loading = true;
            try {
                const response = await api.get('/mangas');
                this.mangas = response.data;
            } catch (err: any) {
                this.error = err.message || 'Error fetching mangas';
            } finally {
                this.loading = false;
            }
        },
        async createManga(manga: MangaInput) {
            this.loading = true;
            try {
                const response = await api.post('/mangas', manga);
                this.mangas.unshift(response.data); // Add to top
            } catch (err: any) {
                this.error = err.message || 'Error creating manga';
            } finally {
                this.loading = false;
            }
        },
        async updateManga(id: string, mangaData: Partial<Manga>) {
            this.loading = true;
            try {
                const response = await api.put(`/mangas/${id}`, mangaData);
                const index = this.mangas.findIndex(m => m._id === id);
                if (index !== -1) {
                    this.mangas[index] = response.data;
                }
            } catch (err: any) {
                this.error = err.message || 'Error updating manga';
            } finally {
                this.loading = false;
            }
        },
        async deleteManga(id: string) {
            try {
                await api.delete(`/mangas/${id}`);
                this.mangas = this.mangas.filter(m => m._id !== id);
            } catch (err: any) {
                this.error = err.message || 'Error deleting manga';
            }
        },
        async searchRemoteMangas(query: string) {
            this.loading = true;
            try {
                const response = await api.get(`/mangas/search-remote?q=${query}`);
                return response.data;
            } catch (err: any) {
                this.error = err.message || 'Error searching remote mangas';
                return [];
            } finally {
                this.loading = false;
            }
        },
        async fetchCover(title: string, volume: number, author?: string) {
            try {
                const response = await api.get('/mangas/cover', {
                    params: { title, volume, author }
                });
                return response.data.imageUrl;
            } catch (err: any) {
                console.error('Error fetching cover:', err);
                return null;
            }
        }
    },
});
