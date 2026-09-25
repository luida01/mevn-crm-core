<template>
  <div class="storefront min-h-screen">
    <ShopHeader />
    <main>
      <CatalogBrowser @select-manga="selectedManga = $event" />
    </main>
    <ShopMangaDialog v-if="selectedManga" :manga="selectedManga" @close="selectedManga = null" @add-to-cart="addToCart" />
    <p v-if="cartMessage" class="cart-toast" role="status" aria-live="polite">{{ cartMessage }} <router-link to="/carrito">Ver carrito</router-link></p>
    <ShopFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CatalogBrowser from '../components/CatalogBrowser.vue';
import ShopFooter from '../components/ShopFooter.vue';
import ShopHeader from '../components/ShopHeader.vue';
import ShopMangaDialog from '../components/ShopMangaDialog.vue';
import { useCartStore, type CartKind } from '../stores/cartStore';
import type { Manga } from '../types/Manga';

const cart = useCartStore();
const selectedManga = ref<Manga | null>(null);
const cartMessage = ref('');
let messageTimer: ReturnType<typeof setTimeout> | undefined;
const addToCart = (kind: CartKind) => {
  if (!selectedManga.value) return;
  const manga = selectedManga.value;
  const error = cart.add(manga, kind);
  cartMessage.value = error || `${manga.title} · Vol. ${manga.volume} agregado al carrito.`;
  if (messageTimer) clearTimeout(messageTimer);
  messageTimer = setTimeout(() => { cartMessage.value = ''; }, 5000);
  if (!error) selectedManga.value = null;
};
</script>
