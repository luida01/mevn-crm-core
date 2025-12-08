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
}
