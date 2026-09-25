import { defineStore } from 'pinia';
import api from '../services/api';
import axios from 'axios';
import { errorMessage } from '../services/errors';
import type { Manga, MangaInput, MangaVolumeSearchResponse, RemoteMangaResult } from '../types/Manga';

export const useMangaStore = defineStore('manga', {
    state: () => ({
        mangas: [] as Manga[],
        currentManga: null as Manga | null,
        loading: false,
        saving: false,
        error: null as string | null,
        searchQuery: '',
        // Filters
        priceRange: 'all' as 'all' | 'under10' | '10to20' | 'over20',
        stockFilter: 'all' as 'all' | 'inStock' | 'lowStock' | 'outOfStock',
        statusFilter: 'all' as 'all' | 'Finished' | 'Publishing',
        genreFilter: 'all' as string,
    }),
    getters: {
        // Standard MAL manga genres
        availableGenres: () => [
            'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
            'Horror', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi',
            'Slice of Life', 'Sports', 'Supernatural', 'Thriller',
            'Shounen', 'Shoujo', 'Seinen', 'Josei', 'Isekai', 'Mecha'
        ],
        filteredMangas: (state) => {
            let result = state.mangas;

            // Filter by search query
            if (state.searchQuery) {
                const query = state.searchQuery.toLowerCase();
                result = result.filter(m =>
                    (m.title?.toLowerCase() || '').includes(query) ||
                    (m.author?.toLowerCase() || '').includes(query) ||
                    (m.genre?.toLowerCase() || '').includes(query)
                );
            }

            // Filter by price range
            if (state.priceRange !== 'all') {
                result = result.filter(m => {
                    const price = m.price || 0;
                    switch (state.priceRange) {
                        case 'under10': return price < 10;
                        case '10to20': return price >= 10 && price <= 20;
                        case 'over20': return price > 20;
                        default: return true;
                    }
                });
            }

            // Filter by stock
            if (state.stockFilter !== 'all') {
                result = result.filter(m => {
                    const stock = m.stock || 0;
                    switch (state.stockFilter) {
                        case 'inStock': return stock > 0;
                        case 'lowStock': return stock > 0 && stock <= 5;
                        case 'outOfStock': return stock === 0;
                        default: return true;
                    }
                });
            }

            // Filter by publication status
            if (state.statusFilter !== 'all') {
                result = result.filter(m => m.status === state.statusFilter);
            }

            // Filter by genre (partial match since manga may have multiple genres)
            if (state.genreFilter !== 'all') {
                result = result.filter(m => m.genre?.includes(state.genreFilter));
            }

            return result;
        }
    },
    actions: {
        async fetchMangas() {
            this.loading = true;
            this.error = null;
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
            if (this.saving) return false;
            this.saving = true;
            this.error = null;
            try {
                const response = await api.post('/mangas', manga);
                this.mangas.unshift(response.data); // Add to top
                return true;
            } catch (err: unknown) {
                this.error = errorMessage(err);
                return false;
            } finally {
                this.saving = false;
            }
        },
        async updateManga(id: string, mangaData: Partial<Manga>) {
            if (this.saving) return false;
            this.saving = true;
            this.error = null;
            try {
                const response = await api.put(`/mangas/${id}`, mangaData);
                const index = this.mangas.findIndex(m => m._id === id);
                if (index !== -1) {
                    this.mangas[index] = response.data;
                }
                return true;
            } catch (err: unknown) {
                this.error = errorMessage(err);
                return false;
            } finally {
                this.saving = false;
            }
        },
        async deleteManga(id: string) {
            if (this.saving) return false;
            this.saving = true;
            this.error = null;
            try {
                await api.delete(`/mangas/${id}`);
                this.mangas = this.mangas.filter(m => m._id !== id);
                return true;
            } catch (err: unknown) {
                this.error = errorMessage(err);
                return false;
            } finally { this.saving = false; }
        },
        async addStock(id: string, quantity: number) {
            if (this.saving) return false;
            this.saving = true; this.error = null;
            try {
                const manga = (await api.put<Manga>('/mangas/' + id + '/stock', { quantity })).data;
                const index = this.mangas.findIndex(item => item._id === id);
                if (index >= 0) this.mangas[index] = manga;
                return true;
            } catch (err: unknown) { this.error = errorMessage(err); return false; }
            finally { this.saving = false; }
        },
        async searchRemoteMangas(query: string) {
            this.loading = true;
            this.error = null;
            try {
                const response = await api.get<RemoteMangaResult[]>('/mangas/search-remote', { params: { q: query } });
                return response.data;
            } catch (err: unknown) {
                if (axios.isAxiosError<{ message?: string }>(err)) {
                    this.error = err.response?.data?.message || err.message || 'Error searching manga catalogs';
                } else {
                    this.error = err instanceof Error ? err.message : 'Error searching manga catalogs';
                }
                return [];
            } finally {
                this.loading = false;
            }
        },
        async searchMangaVolumes(criteria: { title: string; author?: string; malId?: string; mangaDexId?: string }): Promise<MangaVolumeSearchResponse | null> {
            this.error = null;
            try {
                const response = await api.get<MangaVolumeSearchResponse>('/mangas/volumes', { params: criteria });
                return response.data;
            } catch (err: unknown) {
                if (axios.isAxiosError<{ message?: string }>(err)) {
                    this.error = err.response?.data?.message || err.message || 'Error searching manga volumes';
                } else {
                    this.error = err instanceof Error ? err.message : 'Error searching manga volumes';
                }
                return null;
            }
        },
        async fetchCover(title: string, volume: number, author?: string, malId?: string, mangaDexId?: string) {
            try {
                const response = await api.get('/mangas/cover', {
                    params: { title, volume, author, malId, mangaDexId },
                    paramsSerializer: {
                        encode: (value: string) => encodeURIComponent(value)
                    }
                });
                return response.data.imageUrl;
            } catch (err: any) {
                console.error('Error fetching cover:', err);
                return null;
            }
        }
    },
});
