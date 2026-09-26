<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { clearAuthToken } from './services/auth';
import { useMangaStore } from './stores/mangaStore';
const route = useRoute(); const router = useRouter(); const mangaStore = useMangaStore();
const isLogin = computed(() => route.path === '/login');
import { t } from './i18n';
import AppearanceControls from './components/AppearanceControls.vue';
const links = [{ to: '/customers', key: 'nav.customers' }, { to: '/mangas', key: 'nav.mangas' }, { to: '/rentals', key: 'nav.rentals' }, { to: '/orders', key: 'nav.orders' }, { to: '/pipeline', key: 'nav.pipeline' }, { to: '/invoicing', key: 'nav.invoicing' }, { to: '/settings', key: 'nav.settings' }];
const logout = async () => { clearAuthToken(); await router.push('/login'); };
const shopUrl = import.meta.env.VITE_SHOP_URL || window.location.protocol + '//' + window.location.hostname + ':5173';
</script>
<template>
  <div class="admin-shell">
    <template v-if="!isLogin">
      <header class="admin-header"><div class="admin-header__top"><router-link class="admin-brand" to="/"><span aria-hidden="true">M</span>MangaGo <small>Admin</small></router-link><div class="admin-actions"><AppearanceControls /><a :href="shopUrl" target="_blank" rel="noopener noreferrer">{{ t('nav.shop') }}</a><button class="admin-text-button" @click="logout">{{ t('nav.logout') }}</button></div></div><nav :aria-label="t('nav.admin')"><router-link to="/" exact-active-class="selected">{{ t('nav.home') }}</router-link><router-link v-for="link in links" :key="link.to" :to="link.to" active-class="selected">{{ t(link.key) }}</router-link></nav></header>
      <div v-if="route.path === '/mangas'" class="admin-inventory-filters admin-toolbar">
        <label class="admin-search"><span class="sr-only">Buscar manga</span><input v-model="mangaStore.searchQuery" type="search" placeholder="Buscar título, autor o género"></label>
        <label><span class="sr-only">Precio</span><select v-model="mangaStore.priceRange"><option value="all">Todos los precios</option><option value="under10">Menos de $10</option><option value="10to20">$10–$20</option><option value="over20">Más de $20</option></select></label>
        <label><span class="sr-only">Stock</span><select v-model="mangaStore.stockFilter"><option value="all">Todo el stock</option><option value="inStock">Con stock</option><option value="lowStock">Stock bajo (1–5)</option><option value="outOfStock">Sin stock</option></select></label>
        <label><span class="sr-only">Publicación</span><select v-model="mangaStore.statusFilter"><option value="all">Todas las publicaciones</option><option value="Publishing">En publicación</option><option value="Finished">Finalizadas</option></select></label>
        <label><span class="sr-only">Género</span><select v-model="mangaStore.genreFilter"><option value="all">Todos los géneros</option><option v-for="genre in mangaStore.availableGenres" :key="genre" :value="genre">{{ genre }}</option></select></label>
      </div>
    </template>
    <div v-if="isLogin" class="admin-login-controls"><AppearanceControls /></div>
    <main><router-view /></main>
  </div>
</template>
