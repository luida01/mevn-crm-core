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
        :aria-label="mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <svg v-if="!mobileMenuOpen" width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
        <svg v-else width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
      </button>
      <nav id="storefront-navigation" class="site-nav" :class="{ 'site-nav--open': mobileMenuOpen }" aria-label="Navegación principal">
        <a :href="sectionHref('novedades')" @click="mobileMenuOpen = false">Novedades</a>
        <a :href="sectionHref('colecciones')" @click="mobileMenuOpen = false">Colecciones</a>
        <a :href="sectionHref('como-funciona')" @click="mobileMenuOpen = false">Alquileres</a>
        <router-link to="/faq" :aria-current="route.path === '/faq' ? 'page' : undefined" @click="mobileMenuOpen = false">Ayuda</router-link>
        <a class="site-nav__cta" :href="sectionHref('catalogo')" @click="mobileMenuOpen = false">Encuentra tu manga <span aria-hidden="true">↗</span></a>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const mobileMenuOpen = ref(false);
const homePrefix = computed(() => route.path === '/' ? '' : '/');
const sectionHref = (id: string) => `${homePrefix.value}#${id}`;

watch(() => route.fullPath, () => {
  mobileMenuOpen.value = false;
});
</script>
