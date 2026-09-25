import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import CustomersView from '../views/CustomersView.vue';
import MangaListView from '../views/MangaListView.vue';
import RentalsView from '../views/RentalsView.vue';
import LoginView from '../views/LoginView.vue';
import PipelineView from '../views/PipelineView.vue';
import InvoicingView from '../views/InvoicingView.vue';
import SettingsView from '../views/SettingsView.vue';
import OrdersView from '../views/OrdersView.vue';
import { isAuthenticated } from '../services/auth';

const routes: RouteRecordRaw[] = [
    { path: '/pipeline', name: 'pipeline', component: PipelineView, meta: { requiresAuth: true } },
    { path: '/invoicing', name: 'invoicing', component: InvoicingView, meta: { requiresAuth: true } },
    { path: '/settings', name: 'settings', component: SettingsView, meta: { requiresAuth: true } },
    { path: '/orders', name: 'orders', component: OrdersView, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
    {
        path: '/login',
        name: 'login',
        component: LoginView
    },
    {
        path: '/',
        name: 'dashboard',
        component: DashboardView,
        meta: { requiresAuth: true }
    },
    {
        path: '/customers',
        name: 'customers',
        component: CustomersView,
        meta: { requiresAuth: true }
    },
    {
        path: '/mangas',
        name: 'mangas',
        component: MangaListView,
        meta: { requiresAuth: true }
    },
    {
        path: '/rentals',
        name: 'rentals',
        component: RentalsView,
        meta: { requiresAuth: true }
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

router.beforeEach((to) => {
    if (to.meta.requiresAuth && !isAuthenticated()) {
        return { name: 'login', query: { redirect: to.fullPath } };
    }

    if (to.name === 'login' && isAuthenticated()) {
        return { name: 'dashboard' };
    }

    return true;
});

export default router;
