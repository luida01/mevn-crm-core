<template>
  <div class="thematic-collection">
    <h3 class="thematic-collection__title">{{ title }}</h3>
    
    <div v-if="loading" class="section-loading" role="status">Buscando títulos…</div>
    
    <div v-else-if="mangas.length === 0" class="thematic-collection__empty">
      No hay mangas disponibles en esta colección.
    </div>
    
    <div v-else class="relative">
      <!-- Scrollable Container -->
      <div class="thematic-collection__scroller">
        <div class="thematic-collection__rail">
          <div 
            v-for="manga in mangas" 
            :key="manga._id"
            class="thematic-card"
          >
            <div class="thematic-card__cover">
              <img 
                :src="manga.coverImage || '/no-cover.svg'"
                :alt="manga.title"
                loading="lazy"
                @error="handleCoverError"
              >
              <span v-if="manga.malScore" class="thematic-card__score">★ {{ manga.malScore.toFixed(1) }}</span>
            </div>
            <div class="thematic-card__body">
              <h4>{{ manga.title }}</h4>
              <p>{{ manga.author }}</p>
              <div><span>${{ manga.rentalPrice }} / día</span><span>${{ manga.price }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Manga } from '../types/Manga';

const handleCoverError = (event: Event) => {
  const image = event.currentTarget as HTMLImageElement;
  image.onerror = null;
  image.src = '/no-cover.svg';
};

defineProps<{
  title: string;
  mangas: Manga[];
  loading?: boolean;
}>();
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.thematic-collection {
  margin-bottom: 38px;
}

.thematic-collection__title {
  margin: 0 0 16px;
  color: var(--shop-ink);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.45rem;
  font-weight: 700;
}

.thematic-collection__scroller {
  overflow-x: auto;
  padding: 2px 2px 15px;
  scrollbar-width: thin;
  scrollbar-color: #c9b99f transparent;
}

.thematic-collection__rail {
  display: flex;
  width: max-content;
  gap: 16px;
}

.thematic-card {
  width: 190px;
  flex: 0 0 auto;
  overflow: hidden;
  border: 1px solid var(--shop-line);
  border-radius: 15px;
  background: var(--shop-surface);
  box-shadow: 0 6px 15px rgba(49, 39, 27, 0.05);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.thematic-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 24px rgba(49, 39, 27, 0.11);
}

.thematic-card__cover {
  position: relative;
  height: 250px;
  overflow: hidden;
  background: var(--shop-paper-deep);
}

.thematic-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 240ms ease;
}

.thematic-card:hover .thematic-card__cover img { transform: scale(1.04); }

.thematic-card__score {
  position: absolute;
  top: 9px;
  right: 9px;
  border-radius: 999px;
  background: var(--shop-gold);
  padding: 5px 8px;
  color: var(--shop-ink);
  font-size: 0.7rem;
  font-weight: 800;
}

.thematic-card__body { padding: 12px; }

.thematic-card__body h4 {
  display: -webkit-box;
  overflow: hidden;
  min-height: 2.8em;
  margin: 0 0 5px;
  color: var(--shop-ink);
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 0.82rem;
  font-weight: 750;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.thematic-card__body p {
  overflow: hidden;
  margin: 0 0 12px;
  color: var(--shop-muted);
  font-size: 0.72rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thematic-card__body > div {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  border-top: 1px solid var(--shop-line);
  padding-top: 9px;
  color: var(--shop-green);
  font-size: 0.7rem;
  font-weight: 800;
}

.thematic-card__body > div span:last-child { color: var(--shop-accent); }

.thematic-collection__empty {
  border: 1px dashed var(--shop-line);
  border-radius: 14px;
  padding: 24px;
  color: var(--shop-muted);
  text-align: center;
}
</style>
