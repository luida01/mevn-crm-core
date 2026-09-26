<template>
  <div id="top" class="storefront min-h-screen">
    <svg class="gooey-definitions" aria-hidden="true" focusable="false">
      <defs>
        <filter id="mangago-gooey-filter" x="-35%" y="-60%" width="170%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" />
        </filter>
      </defs>
    </svg>

    <ShopHeader />

    <section class="shop-hero" aria-labelledby="shop-hero-title">
      <div class="shop-hero__copy">
        <p class="shop-hero__eyebrow">{{ t('home.eyebrow') }}</p>
        <h1 id="shop-hero-title" class="shop-hero__title">{{ t('home.title') }} <span>{{ t('home.titleAccent') }}</span></h1>
        <p class="shop-hero__description">{{ t('home.description') }}</p>
        <div class="shop-hero__actions">
          <router-link class="gooey-link" to="/catalogo">
            <span class="gooey-link__liquid" aria-hidden="true"><span class="gooey-link__bubble gooey-link__bubble--one"></span><span class="gooey-link__bubble gooey-link__bubble--two"></span></span>
            <span class="gooey-link__label">{{ t('home.explore') }} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
          </router-link>
          <a class="shop-hero__secondary" href="#como-funciona">{{ t('home.how') }} <span aria-hidden="true">↓</span></a>
        </div>
        <div class="shop-hero__proof" aria-label="Ventajas de MangaGo">
          <span><b aria-hidden="true">✓</b> Información por volumen</span>
          <span><b aria-hidden="true">✓</b> Disponibilidad visible</span>
        </div>
      </div>
      <div class="shop-hero__art" aria-label="Manga destacado">
        <span class="hero-sticker hero-sticker--top" aria-hidden="true">Una historia<br>para cada<br>momento</span>
        <span class="hero-sticker hero-sticker--bottom" aria-hidden="true">Lee a tu ritmo</span>
        <article v-if="featuredManga" class="hero-poster">
          <img :src="featuredManga.coverImage || '/no-cover.svg'" :alt="featuredManga.title" @error="handleCoverError">
          <div class="hero-poster__shade"></div>
          <div class="hero-poster__top">
            <span class="hero-poster__tag">Selección de lectores</span>
            <span v-if="featuredManga.malScore" class="hero-poster__score">★ {{ featuredManga.malScore.toFixed(1) }}</span>
          </div>
          <div class="hero-poster__caption">
            <p>{{ t('home.recommendation') }}</p>
            <h2>{{ featuredManga.title }}</h2>
            <span>{{ featuredManga.author }}</span>
          </div>
          <button class="hero-poster__interactive" type="button" :aria-label="`Ver detalles de ${featuredManga.title}`" @click="openMangaDetails(featuredManga)"></button>
        </article>
        <div v-else class="hero-poster hero-poster--empty">Una nueva historia<br>te está esperando</div>
      </div>
    </section>

    <div class="container mx-auto px-4 py-12 storefront-content">
      <!-- Top Rated Carousel -->
      <section id="tendencias" class="mb-16 home-section">
        <div class="home-section__heading">
          <div><p class="section-eyebrow">{{ t('home.readers') }}</p><h2>{{ t('home.popular') }}</h2></div>
          <p>{{ t('home.popularDescription') }}</p>
        </div>
        <MangaCarousel v-if="store.topRated.length > 0" :mangas="store.topRated" @select-manga="openMangaDetails" />
        <div v-else-if="store.loading" class="section-loading" role="status">{{ t('home.trendLoading') }}</div>
        <div v-else class="section-empty">{{ t('home.trendEmpty') }}</div>
      </section>

      <!-- Recent Arrivals -->
      <section id="novedades" class="mb-16 home-section">
        <div class="home-section__heading">
          <div><p class="section-eyebrow">{{ t('home.arrivalsEyebrow') }}</p><h2>{{ t('home.recent') }}</h2></div>
          <p>{{ t('home.latestDescription') }}</p>
        </div>
        <div v-if="store.loading" class="section-loading" role="status">{{ t('home.arrivalsLoading') }}</div>
        <div v-else-if="store.recentArrivals.length > 0" class="arrival-grid">
          <button
            v-for="manga in store.recentArrivals" 
            :key="manga._id"
            class="arrival-card"
            type="button"
            @click="openMangaDetails(manga)"
          >
            <div class="arrival-card__cover">
              <img 
                :src="manga.coverImage || '/no-cover.svg'"
                :alt="manga.title"
                loading="lazy"
                @error="handleCoverError"
              >
              <span v-if="manga.malScore" class="arrival-card__rating">★ {{ manga.malScore.toFixed(1) }}</span>
            </div>
            <div class="arrival-card__body">
              <h3>{{ manga.title }}</h3>
              <p class="arrival-card__author">{{ manga.author }}</p>
              <p class="arrival-card__author">Vol. {{ manga.volume }} · {{ manga.stock > 0 ? t('home.available') : t('home.none') }}</p>
              <div class="arrival-card__prices">
                <span>{{ t('home.rentalDay') }} · ${{ manga.rentalPrice }} / day</span>
                <span>{{ t('home.purchasePrice') }} · ${{ manga.price }}</span>
              </div>
            </div>
          </button>
        </div>
        <div v-else class="section-empty">{{ t('home.arrivalsEmpty') }}</div>
      </section>

      <!-- Rental Info Section -->
      <section id="como-funciona" class="mb-16 home-section">
        <RentalInfoSection />
      </section>

      <!-- Thematic Collections -->
      <section id="colecciones" class="mb-16 home-section">
        <div class="home-section__heading">
          <div><p class="section-eyebrow">{{ t('home.collectionsEyebrow') }}</p><h2>{{ t('home.collectionsTitle') }}</h2></div>
          <p>{{ t('home.collectionsDescription') }}</p>
        </div>
        
        <ThematicCollection 
          :title="t('home.collectionBeginner')"
          :mangas="store.collections.beginner"
          :loading="store.loading"
          @select-manga="openMangaDetails"
        />
        
        <ThematicCollection 
          :title="t('home.collectionAnime')"
          :mangas="store.collections.animeAdaptations"
          :loading="store.loading"
          @select-manga="openMangaDetails"
        />
        
        <ThematicCollection 
          :title="t('home.collectionHorror')"
          :mangas="store.collections.horror"
          :loading="store.loading"
          @select-manga="openMangaDetails"
        />
      </section>

      <!-- Author Collections -->
      <section class="mb-16 home-section">
        <div class="home-section__heading">
          <div><p class="section-eyebrow">{{ t('home.authorEyebrow') }}</p><h2>{{ t('home.authorsTitle') }}</h2></div>
          <p>{{ t('home.authorsDescription') }}</p>
        </div>
        <div v-if="store.loading" class="section-loading" role="status">{{ t('home.authorsLoading') }}</div>
        <div v-else-if="topAuthors.length > 0" class="author-grid">
          <div 
            v-for="author in topAuthors" 
            :key="author._id"
            class="author-card"
          >
            <div class="author-card__icon" aria-hidden="true">✳</div>
            <h3>{{ author._id }}</h3>
            <p>{{ author.count }} {{ author.count === 1 ? t('home.titleSingular') : t('home.volumes') }}<span v-if="author.avgScore"> · ★ {{ author.avgScore.toFixed(1) }}</span></p>
          </div>
        </div>
        <div v-else class="section-empty">{{ t('home.authorsEmpty') }}</div>
      </section>

      <!-- Community Rankings -->
      <section class="community-section mb-16">
        <p class="section-eyebrow">{{ t('home.reading') }}</p>
        <h2 class="community-section__title">{{ t('home.community') }}</h2>
        <div class="community-grid">
          <!-- Most Read This Week -->
          <div class="community-card">
            <h3>{{ t('home.week') }}</h3>
            <div v-if="mostReadWeek.length > 0" class="community-list">
              <button
                v-for="(manga, index) in mostReadWeek" 
                :key="manga._id"
                class="community-list__item"
                type="button"
                @click="openMangaDetails(manga)"
              >
                <span class="community-list__rank">{{ String(index + 1).padStart(2, '0') }}</span>
                <img :src="manga.coverImage || '/no-cover.svg'" :alt="manga.title" class="community-list__cover" loading="lazy" @error="handleCoverError">
                <div class="community-list__copy">
                  <strong>{{ manga.title }}</strong>
                  <span>{{ manga.author }}</span>
                </div>
                <span v-if="manga.malScore" class="community-list__value">★ {{ manga.malScore.toFixed(1) }}</span>
              </button>
            </div>
            <p v-else class="community-empty">{{ t('home.weekEmpty') }}</p>
          </div>

          <!-- Most Rented Today -->
          <div class="community-card">
            <h3>{{ t('home.today') }}</h3>
            <div v-if="mostRentedToday.length > 0" class="community-list">
              <button
                v-for="(manga, index) in mostRentedToday" 
                :key="manga._id"
                class="community-list__item"
                type="button"
                @click="openMangaDetails(manga)"
              >
                <span class="community-list__rank">{{ String(index + 1).padStart(2, '0') }}</span>
                <img :src="manga.coverImage || '/no-cover.svg'" :alt="manga.title" class="community-list__cover" loading="lazy" @error="handleCoverError">
                <div class="community-list__copy">
                  <strong>{{ manga.title }}</strong>
                  <span>{{ manga.author }}</span>
                </div>
                <span class="community-list__value">${{ manga.rentalPrice }}/día</span>
              </button>
            </div>
            <p v-else class="community-empty">{{ t('home.todayEmpty') }}</p>
          </div>
        </div>
      </section>
    </div>

    <ShopMangaDialog v-if="selectedManga" :manga="selectedManga" @close="selectedManga = null" @add-to-cart="handleAddToCart" />
    <p v-if="cartMessage" class="cart-toast" role="status" aria-live="polite">{{ cartMessage }} <router-link to="/carrito">Ver carrito</router-link></p>

    <!-- Footer -->
    <ShopFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useShopStore } from '../stores/shopStore';
import type { Manga } from '../types/Manga';
import MangaCarousel from '../components/MangaCarousel.vue';
import RentalInfoSection from '../components/RentalInfoSection.vue';
import ThematicCollection from '../components/ThematicCollection.vue';
import ShopFooter from '../components/ShopFooter.vue';
import ShopHeader from '../components/ShopHeader.vue';
import ShopMangaDialog from '../components/ShopMangaDialog.vue';
import api from '../services/api';
import { useCartStore, type CartKind } from '../stores/cartStore';
import { t } from '../i18n';

const store = useShopStore();
const selectedManga = ref<Manga | null>(null);
const cart = useCartStore();
const cartMessage = ref('');
let cartMessageTimer: ReturnType<typeof setTimeout> | undefined;
const topAuthors = ref<Array<{ _id: string; count: number; avgScore?: number }>>([]);
const mostReadWeek = ref<Manga[]>([]);
const mostRentedToday = ref<Manga[]>([]);
const featuredManga = computed(() => store.topRated[0] || store.recentArrivals[0] || null);

const openMangaDetails = (manga: Manga) => {
  selectedManga.value = manga;
};

const handleAddToCart = (kind: CartKind) => {
  if (!selectedManga.value) return;
  const error = cart.add(selectedManga.value, kind);
  cartMessage.value = error || `${selectedManga.value.title} · Vol. ${selectedManga.value.volume} agregado al carrito.`;
  if (cartMessageTimer) clearTimeout(cartMessageTimer);
  cartMessageTimer = setTimeout(() => { cartMessage.value = ''; }, 5000);
  if (!error) selectedManga.value = null;
};

const handleCoverError = (event: Event) => {
  const image = event.currentTarget as HTMLImageElement;
  image.onerror = null;
  image.src = '/no-cover.svg';
};

onMounted(async () => {
  await Promise.all([
    store.fetchTopRated(10),
    store.fetchRecentArrivals(6),
    store.fetchCollection('beginner'),
    store.fetchCollection('anime-adaptations'),
    store.fetchCollection('horror')
  ]);

  try {
    const authorsResponse = await api.get<Array<{ _id: string; count: number; avgScore?: number }>>('/shop/top-authors?limit=6');
    topAuthors.value = authorsResponse.data;
  } catch (error) {
    console.error('Error fetching top authors:', error);
  }

  try {
    const [weekResponse, todayResponse] = await Promise.all([
      api.get<Manga[]>('/shop/most-read-week?limit=10'),
      api.get<Manga[]>('/shop/most-rented-today?limit=10')
    ]);
    mostReadWeek.value = weekResponse.data;
    mostRentedToday.value = todayResponse.data;
  } catch (error) {
    console.error('Error fetching community rankings:', error);
  }
});
</script>
