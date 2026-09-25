<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import axios from 'axios';
import api from '../services/api';
import type { Manga } from '../types/Manga';
interface Catalog { items: Manga[]; total: number; page: number; pages: number }
const emit = defineEmits<{ selectManga: [manga: Manga] }>();
const catalog = ref<Catalog>({ items: [], total: 0, page: 1, pages: 0 });
const search = ref('');
const availability = ref('all');
const loading = ref(false);
const error = ref('');
let controller: AbortController | undefined;
const load = async (page = 1) => {
  controller?.abort();
  const request = new AbortController();
  controller = request;
  loading.value = true; error.value = '';
  try {
    const response = await api.get<Catalog>('/shop/catalog', { params: { q: search.value, availability: availability.value, page, limit: 12 }, signal: request.signal });
    catalog.value = response.data;
  } catch (err: unknown) {
    if (!axios.isCancel(err)) error.value = 'No pudimos cargar el catálogo. Intenta de nuevo.';
  } finally { if (controller === request) loading.value = false; }
};
const refresh = () => { void load(catalog.value.page); };
const coverError = (event: Event) => { const img = event.target as HTMLImageElement; if (!img.src.endsWith('/no-cover.svg')) img.src = '/no-cover.svg'; };
onMounted(() => { void load(); window.addEventListener('focus', refresh); });
onUnmounted(() => { controller?.abort(); window.removeEventListener('focus', refresh); });
</script>
<template>
  <section id="catalogo" class="home-section mb-16">
    <div class="home-section__heading"><div><p class="section-eyebrow">Tu próxima lectura</p><h2>Todo el catálogo</h2></div><p>Encuentra cada título y volumen, también los que están esperando reposición.</p></div>
    <form class="catalog-toolbar" role="search" @submit.prevent="load()">
      <label><span class="sr-only">Buscar por título, autor o género</span><input v-model="search" type="search" maxlength="100" placeholder="Título, autor o género"></label>
      <label><span class="sr-only">Disponibilidad</span><select v-model="availability" @change="load()"><option value="all">Todos los volúmenes</option><option value="available">Con stock</option><option value="unavailable">Sin stock</option></select></label>
      <button type="submit" :disabled="loading">Buscar</button>
    </form>
    <p v-if="error" class="section-empty" role="alert">{{ error }} <button type="button" @click="load()">Reintentar</button></p>
    <p v-else-if="loading" class="section-loading" role="status">Cargando catálogo…</p>
    <template v-else>
      <p class="catalog-count" aria-live="polite">{{ catalog.total }} {{ catalog.total === 1 ? 'volumen encontrado' : 'volúmenes encontrados' }}</p>
      <div class="arrival-grid" v-if="catalog.items.length">
        <button v-for="manga in catalog.items" :key="manga._id" type="button" class="arrival-card" @click="emit('selectManga', manga)">
          <div class="arrival-card__cover"><img :src="manga.coverImage || '/no-cover.svg'" :alt="manga.title" loading="lazy" @error="coverError"><span class="catalog-stock" :class="{ 'catalog-stock--empty': manga.stock < 1 }">{{ manga.stock > 0 ? 'Disponible' : 'Sin stock' }}</span></div>
          <div class="arrival-card__body"><h3>{{ manga.title }}</h3><p class="arrival-card__author">Vol. {{ manga.volume }} · {{ manga.author }}</p><div class="arrival-card__prices"><span>Alquiler · ${{ manga.rentalPrice.toFixed(2) }} / día</span><span>Compra · ${{ manga.price.toFixed(2) }}</span></div></div>
        </button>
      </div>
      <div v-else class="section-empty">No hay mangas para esta búsqueda. Prueba otro título o cambia la disponibilidad.</div>
      <nav class="catalog-pagination" v-if="catalog.pages > 1" aria-label="Páginas del catálogo"><button type="button" :disabled="catalog.page <= 1" @click="load(catalog.page - 1)">Anterior</button><span>{{ catalog.page }} / {{ catalog.pages }}</span><button type="button" :disabled="catalog.page >= catalog.pages" @click="load(catalog.page + 1)">Siguiente</button></nav>
    </template>
  </section>
</template>
<style scoped>
.catalog-toolbar { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:20px; }
.catalog-toolbar label:first-child { flex:1; min-width:min(240px,100%); }
.catalog-toolbar input,.catalog-toolbar select { width:100%; padding:12px 14px; border:1px solid var(--shop-line); border-radius:12px; background:var(--shop-surface); color:var(--shop-ink); }
.catalog-toolbar button,.catalog-pagination button { padding:11px 19px; border-radius:12px; background:var(--shop-green); color:white; font-weight:700; }
button:disabled { opacity:.5; cursor:default; }
.catalog-count { margin:0 0 16px; color:var(--shop-muted); font-size:.85rem; }
.catalog-stock { position:absolute; left:10px; bottom:10px; padding:5px 9px; border-radius:8px; background:#315b4c; color:white; font-size:.7rem; font-weight:700; }
.catalog-stock--empty { background:#34362e; }
.catalog-pagination { display:flex; justify-content:center; align-items:center; gap:20px; margin-top:25px; }
@media(max-width:520px) { .catalog-toolbar label { flex:1 1 100%; } .catalog-toolbar button { width:100%; } }
</style>

