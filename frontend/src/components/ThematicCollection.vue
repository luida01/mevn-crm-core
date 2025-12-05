<template>
  <div class="mb-12">
    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">{{ title }}</h3>
    
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
    
    <div v-else-if="mangas.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
      No hay mangas disponibles en esta colección.
    </div>
    
    <div v-else class="relative">
      <!-- Scrollable Container -->
      <div class="overflow-x-auto pb-4 scrollbar-hide">
        <div class="flex gap-6" style="width: max-content;">
          <div 
            v-for="manga in mangas" 
            :key="manga._id"
            class="w-48 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
          >
            <div class="relative overflow-hidden rounded-t-lg">
              <img 
                :src="manga.coverImage || '/placeholder.jpg'" 
                :alt="manga.title"
                class="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-300"
              >
              <div v-if="manga.malScore" class="absolute top-2 right-2 bg-yellow-400 text-gray-900 font-bold px-2 py-1 rounded-full text-xs shadow-lg">
                ⭐ {{ manga.malScore.toFixed(1) }}
              </div>
            </div>
            <div class="p-4">
              <h4 class="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">{{ manga.title }}</h4>
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">{{ manga.author }}</p>
              <div class="flex justify-between items-center text-xs">
                <span class="text-indigo-600 dark:text-indigo-400 font-semibold">${{ manga.rentalPrice }}/día</span>
                <span class="text-green-600 dark:text-green-400 font-semibold">${{ manga.price }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Manga } from '../types/Manga';

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
</style>
