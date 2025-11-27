import { createRouter, createWebHistory } from 'vue-router';
import CustomersView from '../views/CustomersView.vue';
import DashboardView from '../views/DashboardView.vue';

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
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
