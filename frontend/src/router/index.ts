import { createRouter, createWebHistory } from 'vue-router';
import ShopView from '../views/ShopView.vue';
import FaqView from '../views/FaqView.vue';
import RentalPoliciesView from '../views/RentalPoliciesView.vue';
import ReturnPolicyView from '../views/ReturnPolicyView.vue';
import TermsView from '../views/TermsView.vue';

const routes = [
    {
        path: '/',
        name: 'shop',
        component: ShopView
    },
    {
        path: '/faq',
        name: 'faq',
        component: FaqView
    },
    {
        path: '/rental-policies',
        name: 'rental-policies',
        component: RentalPoliciesView
    },
    {
        path: '/return-policy',
        name: 'return-policy',
        component: ReturnPolicyView
    },
    {
        path: '/terms',
        name: 'terms',
        component: TermsView
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

// Scroll to top after each navigation
router.afterEach(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

export default router;
