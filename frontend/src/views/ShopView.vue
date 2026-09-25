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
        <p class="shop-hero__eyebrow">Tu próxima lectura empieza aquí</p>
        <h1 id="shop-hero-title" class="shop-hero__title">Historias que te llevan <span>a otros mundos.</span></h1>
        <p class="shop-hero__description">Descubre tu próxima serie favorita. Explora títulos y consulta los precios y la disponibilidad de cada volumen.</p>
        <div class="shop-hero__actions">
          <a class="gooey-link" href="#catalogo">
            <span class="gooey-link__liquid" aria-hidden="true"><span class="gooey-link__bubble gooey-link__bubble--one"></span><span class="gooey-link__bubble gooey-link__bubble--two"></span></span>
            <span class="gooey-link__label">Explorar mangas <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
          </a>
          <a class="shop-hero__secondary" href="#como-funciona">¿Cómo funciona? <span aria-hidden="true">↓</span></a>
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
            <p>Una recomendación para ti</p>
            <h2>{{ featuredManga.title }}</h2>
            <span>{{ featuredManga.author }}</span>
          </div>
          <button class="hero-poster__interactive" type="button" :aria-label="`Ver detalles de ${featuredManga.title}`" @click="openMangaDetails(featuredManga)"></button>
        </article>
        <div v-else class="hero-poster hero-poster--empty">Una nueva historia<br>te está esperando</div>
      </div>
    </section>

    <div class="container mx-auto px-4 py-12 storefront-content">
      <CatalogBrowser @select-manga="openMangaDetails" />

      <!-- Top Rated Carousel -->
      <section id="tendencias" class="mb-16 home-section">
        <div class="home-section__heading">
          <div><p class="section-eyebrow">Favoritos de la comunidad</p><h2>En boca de todos</h2></div>
          <p>Las historias que están conquistando a quienes leen con nosotros.</p>
        </div>
        <MangaCarousel v-if="store.topRated.length > 0" :mangas="store.topRated" @select-manga="openMangaDetails" />
        <div v-else-if="store.loading" class="section-loading" role="status">Buscando las historias favoritas…</div>
        <div v-else class="section-empty">Pronto encontrarás recomendaciones aquí.</div>
      </section>

      <!-- Recent Arrivals -->
      <section id="novedades" class="mb-16 home-section">
        <div class="home-section__heading">
          <div><p class="section-eyebrow">Acaban de llegar</p><h2>Nuevas historias</h2></div>
          <p>Descubre los últimos títulos que sumamos al catálogo.</p>
        </div>
        <div v-if="store.loading" class="section-loading" role="status">Cargando novedades…</div>
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
              <p class="arrival-card__author">Vol. {{ manga.volume }} · {{ manga.stock > 0 ? 'Disponible' : 'Sin stock' }}</p>
              <div class="arrival-card__prices">
                <span>Alquiler · ${{ manga.rentalPrice }} / día</span>
                <span>Compra · ${{ manga.price }}</span>
              </div>
            </div>
          </button>
        </div>
        <div v-else class="section-empty">Estamos preparando más novedades para ti.</div>
      </section>

      <!-- Rental Info Section -->
      <section id="como-funciona" class="mb-16 home-section">
        <RentalInfoSection />
      </section>

      <!-- Thematic Collections -->
      <section id="colecciones" class="mb-16 home-section">
        <div class="home-section__heading">
          <div><p class="section-eyebrow">Encuentra tu próximo mundo</p><h2>Lee según tu estado de ánimo</h2></div>
          <p>Una puerta de entrada para cada tipo de lector.</p>
        </div>
        
        <ThematicCollection 
          title="Empieza por aquí"
          :mangas="store.collections.beginner"
          :loading="store.loading"
          @select-manga="openMangaDetails"
        />
        
        <ThematicCollection 
          title="Del anime a las páginas"
          :mangas="store.collections.animeAdaptations"
          :loading="store.loading"
          @select-manga="openMangaDetails"
        />
        
        <ThematicCollection 
          title="Misterio para leer de noche"
          :mangas="store.collections.horror"
          :loading="store.loading"
          @select-manga="openMangaDetails"
        />
      </section>

      <!-- Author Collections -->
      <section class="mb-16 home-section">
        <div class="home-section__heading">
          <div><p class="section-eyebrow">Quienes dan vida a cada página</p><h2>Autores que dejan huella</h2></div>
          <p>Conoce a los creadores que más está leyendo la comunidad.</p>
        </div>
        <div v-if="store.loading" class="section-loading" role="status">Cargando autores…</div>
        <div v-else-if="topAuthors.length > 0" class="author-grid">
          <div 
            v-for="author in topAuthors" 
            :key="author._id"
            class="author-card"
          >
            <div class="author-card__icon" aria-hidden="true">✳</div>
            <h3>{{ author._id }}</h3>
            <p>{{ author.count }} {{ author.count === 1 ? 'título' : 'títulos' }}<span v-if="author.avgScore"> · ★ {{ author.avgScore.toFixed(1) }}</span></p>
          </div>
        </div>
        <div v-else class="section-empty">Los autores más leídos aparecerán aquí.</div>
      </section>

      <!-- Community Rankings -->
      <section class="community-section mb-16">
        <p class="section-eyebrow">Lecturas que nos unen</p>
        <h2 class="community-section__title">Lo que la comunidad está leyendo</h2>
        <div class="community-grid">
          <!-- Most Read This Week -->
          <div class="community-card">
            <h3>📖 Más leídos esta semana</h3>
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
            <p v-else class="community-empty">Aún no hay lecturas para mostrar.</p>
          </div>

          <!-- Most Rented Today -->
          <div class="community-card">
            <h3>🔥 Más alquilados hoy</h3>
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
            <p v-else class="community-empty">Los alquileres de hoy aparecerán aquí.</p>
          </div>
        </div>
      </section>
    </div>

    <ShopMangaDialog v-if="selectedManga" :manga="selectedManga" @close="selectedManga = null" @checkout="handleCheckout" />
    <DemoCheckoutDialog v-if="checkoutRequest" :manga="checkoutRequest.manga" :kind="checkoutRequest.kind" @close="checkoutRequest = null" />

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
import DemoCheckoutDialog from '../components/DemoCheckoutDialog.vue';
import CatalogBrowser from '../components/CatalogBrowser.vue';
import api from '../services/api';

const store = useShopStore();
const selectedManga = ref<Manga | null>(null);
const checkoutRequest = ref<{ manga: Manga; kind: 'rental' | 'purchase' } | null>(null);
const topAuthors = ref<Array<{ _id: string; count: number; avgScore?: number }>>([]);
const mostReadWeek = ref<Manga[]>([]);
const mostRentedToday = ref<Manga[]>([]);
const featuredManga = computed(() => store.topRated[0] || store.recentArrivals[0] || null);

const openMangaDetails = (manga: Manga) => {
  selectedManga.value = manga;
};

const handleCheckout = (kind: 'rental' | 'purchase') => {
  if (!selectedManga.value) return;
  checkoutRequest.value = { manga: selectedManga.value, kind };
  selectedManga.value = null;
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
