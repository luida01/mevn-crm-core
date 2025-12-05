import { createRouter, createWebHistory } from 'vue-router';
import CustomersView from '../views/CustomersView.vue';
import DashboardView from '../views/DashboardView.vue';
import MangaListView from '../views/MangaListView.vue';
import RentalsView from '../views/RentalsView.vue';
import ShopView from '../views/ShopView.vue';

const routes = [
    {
        path: '/',
        name: 'shop',
        component: ShopView
    },
    {
        path: '/admin',
        name: 'dashboard',
        component: DashboardView
    },
    {
        path: '/admin/customers',
        name: 'customers',
        component: CustomersView
    },
    {
        path: '/admin/mangas',
        name: 'mangas',
        component: MangaListView
    },
    {
        path: '/admin/rentals',
        name: 'rentals',
        component: RentalsView
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
