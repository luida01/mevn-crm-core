<template>
  <div id="top" class="storefront info-page min-h-screen">
    <ShopHeader />
    <header class="info-hero">
      <div class="info-hero__inner">
        <p class="info-hero__eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
    </header>
    <main class="info-main">
      <aside v-if="notice" class="info-notice" role="note">
        <span class="info-notice__icon" aria-hidden="true">i</span>
        <div><strong>Información de esta versión</strong><p>{{ notice }}</p></div>
      </aside>
      <div class="info-page__content"><slot /></div>
    </main>
    <ShopFooter />
  </div>
</template>

<script setup lang="ts">
import ShopFooter from './ShopFooter.vue';
import ShopHeader from './ShopHeader.vue';

defineProps<{
  eyebrow: string;
  title: string;
  description: string;
  notice?: string;
}>();
</script>
