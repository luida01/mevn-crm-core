import { ref } from 'vue';

export type Locale = 'es' | 'en';
export type Theme = 'light' | 'dark';
const locale = ref<Locale>((localStorage.getItem('mangago-admin-locale') as Locale) || 'es');
const theme = ref<Theme>((localStorage.getItem('mangago-admin-theme') as Theme) || 'light');
const messages: Record<Locale, Record<string, string>> = {
  es: {
    'nav.home': 'Inicio', 'nav.customers': 'Clientes', 'nav.mangas': 'Mangas', 'nav.rentals': 'Alquileres', 'nav.orders': 'Pedidos', 'nav.pipeline': 'Pipeline', 'nav.invoicing': 'Cobros', 'nav.settings': 'Configuración', 'nav.shop': 'Abrir tienda ↗', 'nav.logout': 'Salir',
    'nav.theme': 'Cambiar tema', 'nav.language': 'Cambiar idioma', 'common.light': 'Claro', 'common.dark': 'Oscuro', 'common.spanish': 'Español', 'common.english': 'Inglés', 'nav.admin': 'Navegación administrativa'
  },
  en: {
    'nav.home': 'Home', 'nav.customers': 'Customers', 'nav.mangas': 'Manga', 'nav.rentals': 'Rentals', 'nav.orders': 'Orders', 'nav.pipeline': 'Pipeline', 'nav.invoicing': 'Payments', 'nav.settings': 'Settings', 'nav.shop': 'Open shop ↗', 'nav.logout': 'Log out',
    'nav.theme': 'Toggle theme', 'nav.language': 'Change language', 'common.light': 'Light', 'common.dark': 'Dark', 'common.spanish': 'Spanish', 'common.english': 'English', 'nav.admin': 'Admin navigation'
  }
};
export const t = (key: string): string => messages[locale.value][key] ?? key;
export const getLocale = () => locale.value;
export const getTheme = () => theme.value;
export const toggleLocale = () => { locale.value = locale.value === 'es' ? 'en' : 'es'; localStorage.setItem('mangago-admin-locale', locale.value); document.documentElement.lang = locale.value; };
export const toggleTheme = () => { theme.value = theme.value === 'light' ? 'dark' : 'light'; localStorage.setItem('mangago-admin-theme', theme.value); document.documentElement.dataset.theme = theme.value; };
export const initializePreferences = () => { document.documentElement.lang = locale.value; document.documentElement.dataset.theme = theme.value; };
