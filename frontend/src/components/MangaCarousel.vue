<template>
  <div class="relative w-full overflow-hidden">
    <!-- Carousel Container -->
    <div class="relative h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-xl">
      <!-- Manga Display -->
      <transition name="fade" mode="out-in">
        <div v-if="currentManga" :key="currentManga._id" class="absolute inset-0 flex items-center justify-center p-8">
          <div class="flex gap-8 items-center max-w-6xl">
            <!-- Cover Image -->
            <div class="relative group">
              <img 
                :src="currentManga.coverImage || '/placeholder.jpg'" 
                :alt="currentManga.title"
                class="w-64 h-96 object-cover rounded-lg shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
              >
              <div v-if="currentManga.malScore" class="absolute top-4 right-4 bg-yellow-400 text-gray-900 font-bold px-3 py-1 rounded-full shadow-lg">
                ⭐ {{ currentManga.malScore.toFixed(1) }}
              </div>
            </div>
            
            <!-- Info -->
            <div class="flex-1 text-left">
              <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">{{ currentManga.title }}</h2>
              <p class="text-xl text-gray-600 dark:text-gray-300 mb-4">{{ currentManga.author }}</p>
              <p class="text-gray-700 dark:text-gray-400 mb-6 line-clamp-4">{{ currentManga.description || 'No description available.' }}</p>
              
              <div class="flex gap-4 items-center mb-6">
                <span class="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-medium">
                  {{ currentManga.genre }}
                </span>
                <span v-if="currentManga.status" class="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                  {{ currentManga.status }}
                </span>
              </div>
              
              <div class="flex gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">${{ currentManga.rentalPrice }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">Alquiler / día</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600 dark:text-green-400">${{ currentManga.price }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">Compra</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
      
      <!-- Navigation Arrows -->
      <button 
        @click="prev" 
        class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 p-3 rounded-full shadow-lg transition-all"
      >
        <svg class="w-6 h-6 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <button 
        @click="next" 
        class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 p-3 rounded-full shadow-lg transition-all"
      >
        <svg class="w-6 h-6 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
      
      <!-- Indicators -->
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <button 
          v-for="(manga, index) in mangas" 
          :key="manga._id"
          @click="currentIndex = index"
          :class="index === currentIndex ? 'bg-indigo-600 w-8' : 'bg-gray-400 w-2'"
          class="h-2 rounded-full transition-all"
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

const currentIndex = ref(0);
let autoPlayInterval: any = null;

const currentManga = computed(() => props.mangas[currentIndex.value]);

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % props.mangas.length;
};

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + props.mangas.length) % props.mangas.length;
};

const startAutoPlay = () => {
  autoPlayInterval = setInterval(next, 5000); // 5 seconds
};

const stopAutoPlay = () => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
  }
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
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
