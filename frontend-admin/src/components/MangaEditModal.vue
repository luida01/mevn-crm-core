<script setup lang="ts">
import { ref, watch } from 'vue';
import AdminDialog from './AdminDialog.vue';
import { useMangaStore } from '../stores/mangaStore';
import type { Manga } from '../types/Manga';
const props = defineProps<{ isOpen: boolean; manga: Manga | null }>();
const emit = defineEmits<{ close: []; save: [prices: { rentalPrice: number; price: number }] }>();
const store = useMangaStore();
const form = ref({ rentalPrice: 0, price: 0 });
watch(() => props.manga, manga => { if (manga) form.value = { rentalPrice: manga.rentalPrice, price: manga.price }; }, { immediate: true });
</script>
<template>
  <AdminDialog v-if="isOpen" title="Editar precios" :busy="store.saving" @close="emit('close')">
    <p v-if="store.error" class="admin-alert" role="alert">{{ store.error }}</p>
    <form class="admin-form" @submit.prevent="emit('save', { ...form })">
      <label>Alquiler por día ($)<input v-model.number="form.rentalPrice" type="number" step="0.01" min="0" required></label>
      <label>Precio de compra ($)<input v-model.number="form.price" type="number" step="0.01" min="0" required></label>
      <footer class="admin-actions"><button type="button" class="admin-button secondary" :disabled="store.saving" @click="emit('close')">Cancelar</button><button class="admin-button" :disabled="store.saving">{{ store.saving ? 'Guardando…' : 'Guardar precios' }}</button></footer>
    </form>
  </AdminDialog>
</template>
