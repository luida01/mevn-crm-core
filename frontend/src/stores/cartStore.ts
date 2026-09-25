import { defineStore } from 'pinia';
import type { Manga } from '../types/Manga';

export type CartKind = 'rental' | 'purchase';
export interface CartLine {
    manga: Manga;
    kind: CartKind;
    quantity: number;
    days: number;
}

const STORAGE_KEY = 'mangago-cart-v1';
const clampInteger = (value: number, min: number, max: number) => Math.max(min, Math.min(max, Math.trunc(value) || min));

const readStoredLines = (): CartLine[] => {
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((entry): entry is CartLine => {
            if (!entry || typeof entry !== 'object') return false;
            const line = entry as Partial<CartLine>;
            const manga = line.manga;
            return Boolean(manga && typeof manga === 'object' && typeof manga._id === 'string' &&
                typeof manga.title === 'string' && typeof manga.author === 'string' &&
                Number.isFinite(manga.volume) && Number.isFinite(manga.stock) &&
                Number.isFinite(manga.price) && Number.isFinite(manga.rentalPrice) &&
                (line.kind === 'rental' || line.kind === 'purchase') &&
                Number.isInteger(line.quantity) && Number(line.quantity) > 0 &&
                Number.isInteger(line.days) && Number(line.days) > 0);
        }).map(line => ({
            ...line,
            quantity: clampInteger(line.quantity, 1, Math.max(1, line.manga.stock)),
            days: clampInteger(line.days, 1, 30)
        }));
    } catch {
        return [];
    }
};

export const useCartStore = defineStore('cart', {
    state: () => ({ lines: [] as CartLine[] }),
    getters: {
        itemCount: state => state.lines.reduce((sum, line) => sum + line.quantity, 0),
        subtotal: state => state.lines.reduce((sum, line) => sum + (line.kind === 'purchase'
            ? line.manga.price * line.quantity
            : line.manga.rentalPrice * line.days * line.quantity), 0)
    },
    actions: {
        hydrate() {
            this.lines = readStoredLines();
            this.persist();
        },
        persist() {
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.lines)); } catch { /* Cart remains available until this tab closes. */ }
        },
        add(manga: Manga, kind: CartKind): string | null {
            if (!manga._id || manga.stock < 1) return 'Este volumen no tiene unidades disponibles.';
            if (kind === 'purchase' && manga.price <= 0) return 'Este volumen no está disponible para compra.';
            if (kind === 'rental' && manga.rentalPrice <= 0) return 'Este volumen no está disponible para alquiler.';
            const inCart = this.lines.filter(line => line.manga._id === manga._id).reduce((sum, line) => sum + line.quantity, 0);
            if (inCart >= manga.stock) return `Solo hay ${manga.stock} unidades disponibles de este volumen.`;
            const existing = this.lines.find(line => line.manga._id === manga._id && line.kind === kind);
            if (existing) existing.quantity += 1;
            else this.lines.push({ manga, kind, quantity: 1, days: 1 });
            this.persist();
            return null;
        },
        setQuantity(lineKey: string, quantity: number) {
            const line = this.lines.find(item => `${item.manga._id}:${item.kind}` === lineKey);
            if (!line) return;
            const otherQuantity = this.lines.filter(item => item.manga._id === line.manga._id && item !== line)
                .reduce((sum, item) => sum + item.quantity, 0);
            const max = Math.max(1, line.manga.stock - otherQuantity);
            line.quantity = clampInteger(quantity, 1, max);
            this.persist();
        },
        setDays(lineKey: string, days: number) {
            const line = this.lines.find(item => `${item.manga._id}:${item.kind}` === lineKey);
            if (!line || line.kind !== 'rental') return;
            line.days = clampInteger(days, 1, 30);
            this.persist();
        },
        remove(lineKey: string) {
            this.lines = this.lines.filter(item => `${item.manga._id}:${item.kind}` !== lineKey);
            this.persist();
        },
        clear() {
            this.lines = [];
            this.persist();
        }
    }
});
