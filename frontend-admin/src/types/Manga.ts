export interface Manga {
    _id?: string;
    title: string;
    volume: number;
    author: string;
    genre: string;
    isbn?: string;
    price: number;
    rentalPrice: number;
    stock: number;
    coverImage?: string;
    description?: string;
    publishedYear?: number;
    status?: string;
    malScore?: number;
    malId?: string;
    mangaDexId?: string;
    createdAt?: string;
}

export interface MangaInput {
    title: string;
    volume: number;
    author: string;
    genre: string;
    isbn?: string;
    price: number;
    rentalPrice: number;
    stock: number;
    coverImage?: string;
    description?: string;
    publishedYear?: number;
    status?: string;
    malScore?: number;
    malId?: string;
    mangaDexId?: string;
}

export interface RemoteMangaResult {
    title: string;
    alternativeTitles?: string[];
    author: string;
    genre: string;
    description: string;
    coverImage: string | null;
    publishedYear: number | null;
    status: string;
    malScore: number | null;
    malId: string | null;
    mangaDexId?: string;
    provider: 'MyAnimeList' | 'MangaDex';
}

export interface AvailableMangaVolume {
    volume: number;
    coverImage: string;
    locale: string;
}

export interface MangaVolumeSearchResponse {
    mangaDexId: string;
    title: string;
    author: string;
    volumes: AvailableMangaVolume[];
}
