<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import axios from 'axios';
import api from '../services/api';
import type { Manga } from '../types/Manga';
import { t } from '../i18n';

interface Catalog { items: Manga[]; total: number; page: number; pages: number }
interface CatalogFilters { titles: string[]; authors: string[]; volumes: number[] }
const emit = defineEmits<{ selectManga: [manga: Manga] }>();
const catalog = ref<Catalog>({ items: [], total: 0, page: 1, pages: 0 });
const filters = ref<CatalogFilters>({ titles: [], authors: [], volumes: [] });
const search = ref('');
const title = ref('');
const volume = ref('');
const author = ref('');
const availability = ref('all');
const mode = ref('all');
const loading = ref(false);
const filtersLoading = ref(false);
const error = ref('');
let controller: AbortController | undefined;

const loadFilters = async (selectedTitle = '') => {
  filtersLoading.value = true;
  try {
    const response = await api.get<CatalogFilters>('/shop/catalog/filters', { params: selectedTitle ? { title: selectedTitle } : {} });
    filters.value = response.data;
  } catch {
    error.value = 'No pudimos cargar las opciones del catálogo. Intenta de nuevo.';
  } finally { filtersLoading.value = false; }
};

const load = async (page = 1) => {
  controller?.abort();
  const request = new AbortController();
  controller = request;
  loading.value = true;
  error.value = '';
  try {
    const response = await api.get<Catalog>('/shop/catalog', {
      params: {
        q: search.value.trim(), title: title.value, volume: volume.value,
        author: author.value, availability: availability.value, mode: mode.value, page, limit: 12
      },
      signal: request.signal
    });
    catalog.value = response.data;
  } catch (err: unknown) {
    if (!axios.isCancel(err)) error.value = 'No pudimos cargar el catálogo. Intenta de nuevo.';
  } finally { if (controller === request) loading.value = false; }
};

const changeTitle = async () => {
  volume.value = '';
  await loadFilters(title.value);
  await load();
};

const resetFilters = async () => {
  search.value = '';
  title.value = '';
  volume.value = '';
  author.value = '';
  availability.value = 'all';
  mode.value = 'all';
  await loadFilters();
  await load();
};

const refresh = () => { void load(catalog.value.page || 1); };
const coverError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (!img.src.endsWith('/no-cover.svg')) img.src = '/no-cover.svg';
};

onMounted(async () => {
  await loadFilters();
  await load();
  window.addEventListener('focus', refresh);
});
onUnmounted(() => { controller?.abort(); window.removeEventListener('focus', refresh); });
</script>

<template>
  <section class="catalog-page__content" aria-labelledby="catalog-title">
    <div class="catalog-page__intro">
      <p class="section-eyebrow">{{ t('catalog.eyebrow') }}</p>
      <h1 id="catalog-title">{{ t('catalog.title') }}</h1>
      <p>{{ t('catalog.description') }}</p>
    </div>

    <form class="catalog-toolbar" role="search" @submit.prevent="load()">
      <label class="catalog-toolbar__search">
        <span>{{ t('catalog.search') }}</span>
        <input v-model="search" type="search" maxlength="100" placeholder="Título, autor o género">
      </label>
      <div class="catalog-filters">
        <label><span>{{ t('catalog.manga') }}</span><select v-model="title" :disabled="filtersLoading" @change="changeTitle"><option value="">{{ t('catalog.allManga') }}</option><option v-for="item in filters.titles" :key="item" :value="item">{{ item }}</option></select></label>
        <label><span>{{ t('catalog.volume') }}</span><select v-model="volume" :disabled="!title || filtersLoading" @change="load()"><option value="">{{ t('catalog.allVolumes') }}</option><option v-for="item in filters.volumes" :key="item" :value="String(item)">Vol. {{ item }}</option></select></label>
        <label><span>{{ t('catalog.author') }}</span><select v-model="author" :disabled="filtersLoading" @change="load()"><option value="">{{ t('catalog.allAuthors') }}</option><option v-for="item in filters.authors" :key="item" :value="item">{{ item }}</option></select></label>
        <label><span>{{ t('catalog.availability') }}</span><select v-model="availability" @change="load()"><option value="all">{{ t('catalog.allStock') }}</option><option value="available">{{ t('catalog.available') }}</option><option value="unavailable">{{ t('catalog.unavailable') }}</option></select></label>
        <label><span>{{ t('catalog.mode') }}</span><select v-model="mode" @change="load()"><option value="all">{{ t('catalog.buyRent') }}</option><option value="purchase">{{ t('catalog.purchase') }}</option><option value="rental">{{ t('catalog.rental') }}</option></select></label>
      </div>
      <div class="catalog-toolbar__actions"><button type="submit" :disabled="loading">{{ t('catalog.search') }}</button><button type="button" class="catalog-toolbar__reset" :disabled="loading" @click="resetFilters">{{ t('catalog.clear') }}</button></div>
    </form>

    <p v-if="error" class="section-empty" role="alert">{{ error }} <button type="button" @click="loadFilters().then(() => load())">Reintentar</button></p>
    <p v-else-if="loading" class="section-loading" role="status">{{ t('catalog.loading') }}</p>
    <template v-else>
      <p class="catalog-count" aria-live="polite">{{ catalog.total }} {{ t(catalog.total === 1 ? 'catalog.foundOne' : 'catalog.foundMany') }}</p>
      <div class="arrival-grid" v-if="catalog.items.length">
        <button v-for="manga in catalog.items" :key="manga._id" type="button" class="arrival-card" @click="emit('selectManga', manga)">
          <div class="arrival-card__cover"><img :src="manga.coverImage || '/no-cover.svg'" :alt="manga.title" loading="lazy" @error="coverError"><span class="catalog-stock" :class="{ 'catalog-stock--empty': manga.stock < 1 }">{{ manga.stock > 0 ? t('catalog.available') : t('catalog.unavailable') }}</span></div>
          <div class="arrival-card__body"><h2>{{ manga.title }}</h2><p class="arrival-card__author">Vol. {{ manga.volume }} · {{ manga.author }}</p><div class="arrival-card__prices"><span v-if="manga.rentalPrice > 0">Alquiler · ${{ manga.rentalPrice.toFixed(2) }} / día</span><span v-if="manga.price > 0">Compra · ${{ manga.price.toFixed(2) }}</span></div></div>
        </button>
      </div>
      <div v-else class="section-empty">{{ t('catalog.notFound') }}</div>
      <nav class="catalog-pagination" v-if="catalog.pages > 1" aria-label="Páginas del catálogo"><button type="button" :disabled="catalog.page <= 1" @click="load(catalog.page - 1)">{{ t('catalog.previous') }}</button><span>{{ catalog.page }} / {{ catalog.pages }}</span><button type="button" :disabled="catalog.page >= catalog.pages" @click="load(catalog.page + 1)">{{ t('catalog.next') }}</button></nav>
    </template>
  </section>
</template>

<style scoped>
.catalog-page__content { max-width: 1240px; margin-inline: auto; padding: 50px 32px 90px; }
.catalog-page__intro { margin-bottom: 27px; }
.catalog-page__intro h1 { margin: 0; color: var(--shop-ink); font: 800 clamp(2.5rem, 5vw, 4rem)/1.05 Georgia, 'Times New Roman', serif; letter-spacing: -.04em; }
.catalog-page__intro > p:last-child { max-width: 640px; margin: 12px 0 0; color: var(--shop-muted); line-height: 1.65; }
.catalog-toolbar { margin-bottom: 24px; border: 1px solid var(--shop-line); border-radius: 20px; background: var(--shop-surface); padding: 20px; box-shadow: 0 10px 28px rgba(49,39,27,.045); }
.catalog-toolbar label { display: grid; gap: 7px; color: var(--shop-ink); font-size: .76rem; font-weight: 750; }
.catalog-toolbar input,.catalog-toolbar select { min-width: 0; width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid var(--shop-line); border-radius: 11px; background: #fff; color: var(--shop-ink); font: inherit; font-size: .84rem; }
.catalog-toolbar__search { margin-bottom: 15px; }
.catalog-filters { display: grid; grid-template-columns: repeat(5,minmax(0,1fr)); gap: 11px; }
.catalog-toolbar__actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
.catalog-toolbar__actions button,.catalog-pagination button { min-height: 42px; border: 0; border-radius: 11px; background: var(--shop-green); padding: 0 17px; color: white; font: inherit; font-size: .8rem; font-weight: 750; cursor: pointer; }
.catalog-toolbar__actions .catalog-toolbar__reset { border: 1px solid var(--shop-line); background: transparent; color: var(--shop-ink); }
.catalog-toolbar button:disabled,.catalog-pagination button:disabled { opacity: .5; cursor: default; }
.catalog-count { margin: 0 0 16px; color: var(--shop-muted); font-size: .85rem; }
.arrival-card__body h2 { display: -webkit-box; min-height: 2.8em; overflow: hidden; margin: 0 0 6px; color: var(--shop-ink); font-size: .9rem; font-weight: 800; line-height: 1.4; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.catalog-stock { position: absolute; left: 10px; bottom: 10px; padding: 5px 9px; border-radius: 8px; background: #315b4c; color: white; font-size: .7rem; font-weight: 700; }
.catalog-stock--empty { background: #34362e; }
.catalog-pagination { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 25px; }
@media(max-width:900px) { .catalog-filters { grid-template-columns: repeat(3,minmax(0,1fr)); } }
@media(max-width:600px) { .catalog-page__content { padding: 34px 17px 65px; } .catalog-toolbar { padding: 15px; } .catalog-filters { grid-template-columns: repeat(2,minmax(0,1fr)); } .catalog-toolbar__actions button { flex: 1; } }
@media(max-width:390px) { .catalog-filters { grid-template-columns: 1fr; } }
</style>
