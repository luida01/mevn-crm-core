<template>
  <div class="feature-carousel" aria-label="Manga destacado">
    <div class="feature-carousel__frame" @mouseenter="stopAutoPlay" @mouseleave="startAutoPlay" @focusin="stopAutoPlay" @focusout="startAutoPlay">
      <!-- Manga Display -->
      <transition name="fade" mode="out-in">
        <div v-if="currentManga" :key="currentManga._id" class="feature-carousel__slide" aria-live="polite">
          <div class="feature-carousel__cover-wrap">
            <!-- Cover Image -->
            <div class="feature-carousel__cover">
              <img 
                :src="currentManga.coverImage || '/no-cover.svg'"
                :alt="currentManga.title"
                loading="lazy"
                @error="handleCoverError"
              >
              <span v-if="currentManga.malScore" class="feature-carousel__score">★ {{ currentManga.malScore.toFixed(1) }}</span>
            </div>
          </div>

            <!-- Info -->
            <div class="feature-carousel__info">
              <p class="feature-carousel__eyebrow">Una lectura que recomendamos</p>
              <h2>{{ currentManga.title }}</h2>
              <p class="feature-carousel__author">{{ currentManga.author }}</p>
              <p class="feature-carousel__description">{{ currentManga.description || 'Una nueva aventura te espera en estas páginas.' }}</p>
              
              <div class="feature-carousel__tags">
                <span>
                  {{ currentManga.genre }}
                </span>
                <span v-if="currentManga.status" class="feature-carousel__status">
                  {{ currentManga.status }}
                </span>
              </div>
              
              <div class="feature-carousel__prices">
                <div>
                  <strong>${{ currentManga.rentalPrice }}</strong>
                  <span>Alquiler / día</span>
                </div>
                <div>
                  <strong>${{ currentManga.price }}</strong>
                  <span>Para tu colección</span>
                </div>
              </div>
              <button class="feature-carousel__details" type="button" @click="showDetails">Ver ficha del manga <span aria-hidden="true">↗</span></button>
            </div>
        </div>
      </transition>
      
      <!-- Navigation Arrows -->
      <button 
        @click="prev" 
        aria-label="Manga anterior"
        class="feature-carousel__arrow feature-carousel__arrow--previous"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <button 
        @click="next" 
        aria-label="Manga siguiente"
        class="feature-carousel__arrow feature-carousel__arrow--next"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
      
      <!-- Indicators -->
      <div class="feature-carousel__indicators" aria-label="Elegir manga destacado">
        <button 
          v-for="(manga, index) in mangas" 
          :key="manga._id"
          @click="currentIndex = index"
          :aria-label="`Ver manga ${index + 1}: ${manga.title}`"
          :aria-current="index === currentIndex ? 'true' : undefined"
          :class="index === currentIndex ? 'feature-carousel__indicator--active' : ''"
          class="feature-carousel__indicator"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Manga } from '../types/Manga';

const props = defineProps<{
  mangas: Manga[];
}>();
const emit = defineEmits<{ selectManga: [manga: Manga] }>();

const currentIndex = ref(0);
let autoPlayInterval: ReturnType<typeof setInterval> | undefined;

const currentManga = computed(() => props.mangas[currentIndex.value]);

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % props.mangas.length;
};

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + props.mangas.length) % props.mangas.length;
};

const showDetails = () => {
  if (currentManga.value) emit('selectManga', currentManga.value);
};

const startAutoPlay = () => {
  if (autoPlayInterval || props.mangas.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  autoPlayInterval = setInterval(next, 5000); // 5 seconds
};

const stopAutoPlay = () => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = undefined;
  }
};

const handleCoverError = (event: Event) => {
  const image = event.currentTarget as HTMLImageElement;
  image.onerror = null;
  image.src = '/no-cover.svg';
};

onMounted(() => {
  if (props.mangas.length > 0) {
    startAutoPlay();
  }
});

onUnmounted(() => {
  stopAutoPlay();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.35s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.feature-carousel {
  position: relative;
  overflow: hidden;
  border: 1px solid #e2d4bf;
  border-radius: 25px;
  background: linear-gradient(125deg, #eee4d3, #f5e8d6 55%, #e5d3bb);
  box-shadow: 0 16px 36px rgba(49, 39, 27, 0.09);
}

.feature-carousel__frame {
  position: relative;
  min-height: 430px;
}

.feature-carousel__slide {
  display: grid;
  min-height: 430px;
  grid-template-columns: minmax(210px, 0.75fr) minmax(0, 1.25fr);
  align-items: center;
  gap: clamp(28px, 6vw, 76px);
  padding: 36px 84px 60px;
}

.feature-carousel__cover-wrap {
  display: grid;
  place-items: center;
}

.feature-carousel__cover {
  position: relative;
  width: clamp(190px, 23vw, 260px);
  aspect-ratio: 2 / 3;
  overflow: hidden;
  border: 6px solid #fffdf8;
  border-radius: 15px;
  background: #e4d7c4;
  box-shadow: 0 18px 32px rgba(38, 34, 26, 0.2);
  transform: rotate(-2deg);
  transition: transform 250ms ease;
}

.feature-carousel__cover:hover {
  transform: rotate(0) translateY(-4px);
}

.feature-carousel__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.feature-carousel__score {
  position: absolute;
  top: 12px;
  right: 12px;
  border-radius: 999px;
  background: #e5b651;
  padding: 7px 10px;
  color: #252720;
  font-size: 0.78rem;
  font-weight: 800;
}

.feature-carousel__info {
  max-width: 600px;
}

.feature-carousel__eyebrow {
  margin: 0 0 12px;
  color: #315b4c;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.feature-carousel__info h2 {
  margin: 0;
  color: #252720;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.1rem, 4.4vw, 3.6rem);
  font-weight: 700;
  letter-spacing: -0.045em;
  line-height: 1.02;
}

.feature-carousel__author {
  margin: 11px 0 0;
  color: #5f6259;
  font-size: 1.05rem;
  font-weight: 600;
}

.feature-carousel__description {
  display: -webkit-box;
  overflow: hidden;
  margin: 19px 0 22px;
  color: #64665e;
  font-size: 0.95rem;
  line-height: 1.7;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.feature-carousel__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.feature-carousel__tags span {
  border-radius: 999px;
  background: #dce7dc;
  padding: 7px 12px;
  color: #315b4c;
  font-size: 0.75rem;
  font-weight: 700;
}

.feature-carousel__tags .feature-carousel__status {
  background: rgba(255, 253, 248, 0.85);
  color: #686a61;
}

.feature-carousel__prices {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.feature-carousel__prices div {
  min-width: 136px;
  border: 1px solid rgba(49, 39, 27, 0.09);
  border-radius: 13px;
  background: rgba(255, 253, 248, 0.68);
  padding: 11px 14px;
}

.feature-carousel__prices strong,
.feature-carousel__prices span {
  display: block;
}

.feature-carousel__details {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-top: 17px;
  border: 0;
  border-radius: 999px;
  background: var(--shop-green);
  padding: 11px 16px;
  color: white;
  cursor: pointer;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 800;
  transition: transform 150ms ease, background 150ms ease;
}

.feature-carousel__details:hover { transform: translateY(-2px); background: #244738; }

.feature-carousel__prices strong {
  color: #c34b31;
  font-size: 1.18rem;
  font-weight: 800;
}

.feature-carousel__prices span {
  margin-top: 2px;
  color: #74756e;
  font-size: 0.72rem;
}

.feature-carousel__arrow {
  position: absolute;
  z-index: 2;
  top: 50%;
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid rgba(49, 39, 27, 0.12);
  border-radius: 50%;
  background: rgba(255, 253, 248, 0.9);
  color: #252720;
  box-shadow: 0 5px 14px rgba(49, 39, 27, 0.08);
  transform: translateY(-50%);
  transition: background 150ms ease, transform 150ms ease;
}

.feature-carousel__arrow:hover {
  background: #fff;
  transform: translateY(-50%) scale(1.06);
}

.feature-carousel__arrow--previous { left: 20px; }
.feature-carousel__arrow--next { right: 20px; }

.feature-carousel__indicators {
  position: absolute;
  right: 0;
  bottom: 18px;
  left: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.feature-carousel__indicator {
  width: 8px;
  height: 8px;
  border: 0;
  border-radius: 999px;
  background: #b9b0a1;
  padding: 0;
  transition: width 180ms ease, background 180ms ease;
}

.feature-carousel__indicator--active {
  width: 26px;
  background: #c34b31;
}

@media (max-width: 700px) {
  .feature-carousel { border-radius: 20px; }
  .feature-carousel__frame,
  .feature-carousel__slide { min-height: 0; }
  .feature-carousel__slide {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 30px 48px 62px;
  }
  .feature-carousel__cover { width: min(68vw, 220px); }
  .feature-carousel__info { text-align: center; }
  .feature-carousel__details { margin-inline: auto; }
  .feature-carousel__tags,
  .feature-carousel__prices { justify-content: center; }
  .feature-carousel__description { margin-block: 14px 18px; }
  .feature-carousel__arrow { width: 36px; height: 36px; }
  .feature-carousel__arrow--previous { left: 7px; }
  .feature-carousel__arrow--next { right: 7px; }
}
</style>
