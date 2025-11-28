import { createRouter, createWebHistory } from 'vue-router';
import CustomersView from '../views/CustomersView.vue';
import DashboardView from '../views/DashboardView.vue';
import MangaListView from '../views/MangaListView.vue';

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
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
