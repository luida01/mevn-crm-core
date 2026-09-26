<template>
  <header class="site-header">
    <div class="site-header__inner">
      <router-link to="/" class="site-brand" aria-label="MangaGo, inicio">
        <img src="/logo.png" alt="MangaGo">
      </router-link>
      <button
        type="button"
        class="site-nav__menu-button"
        :aria-expanded="mobileMenuOpen"
        aria-controls="storefront-navigation"
        :aria-label="mobileMenuOpen ? t('nav.close') : t('nav.open')"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <svg v-if="!mobileMenuOpen" width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
        <svg v-else width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
      </button>
      <nav id="storefront-navigation" class="site-nav" :class="{ 'site-nav--open': mobileMenuOpen }" :aria-label="t('nav.main')">
        <router-link to="/catalogo" :aria-current="route.path === '/catalogo' ? 'page' : undefined" @click="mobileMenuOpen = false">{{ t('nav.catalog') }}</router-link>
        <a :href="sectionHref('novedades')" @click="mobileMenuOpen = false">{{ t('nav.new') }}</a>
        <a :href="sectionHref('colecciones')" @click="mobileMenuOpen = false">{{ t('nav.collections') }}</a>
        <a :href="sectionHref('como-funciona')" @click="mobileMenuOpen = false">{{ t('nav.rentals') }}</a>
        <router-link to="/faq" :aria-current="route.path === '/faq' ? 'page' : undefined" @click="mobileMenuOpen = false">{{ t('nav.help') }}</router-link>
        <AppearanceControls />
        <router-link class="site-nav__cart" to="/carrito" :aria-label="`${t('nav.cart')}, ${cart.itemCount}`" @click="mobileMenuOpen = false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="20" r="1.2" fill="currentColor"/><circle cx="18" cy="20" r="1.2" fill="currentColor"/></svg>
          <span>{{ t('nav.cart') }}</span><b v-if="cart.itemCount" class="site-nav__cart-count">{{ cart.itemCount }}</b>
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useCartStore } from '../stores/cartStore';
import AppearanceControls from './AppearanceControls.vue';
import { t } from '../i18n';

const route = useRoute();
const mobileMenuOpen = ref(false);
const cart = useCartStore();
const homePrefix = computed(() => route.path === '/' ? '' : '/');
const sectionHref = (id: string) => `${homePrefix.value}#${id}`;

watch(() => route.fullPath, () => {
  mobileMenuOpen.value = false;
});
</script>
