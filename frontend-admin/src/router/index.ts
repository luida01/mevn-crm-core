import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import CustomersView from '../views/CustomersView.vue';
import MangaListView from '../views/MangaListView.vue';
import RentalsView from '../views/RentalsView.vue';

const routes = [
    {
        path: '/',
        name: 'dashboard',
        component: DashboardView
    },
    {
        path: '/customers',
        name: 'customers',
        component: CustomersView
    },
    {
        path: '/mangas',
        name: 'mangas',
        component: MangaListView
    },
    {
        path: '/rentals',
        name: 'rentals',
        component: RentalsView
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(_to, _from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        return { top: 0 };
    }
});

export default router;
