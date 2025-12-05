<script setup lang="ts">
import type { Manga } from '../types/Manga';

defineProps<{
  manga: Manga;
}>();

defineEmits(['close']);
</script>

<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] min-h-[500px]">
      
      <!-- Close Button -->
      <button @click="$emit('close')" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Cover Image -->
      <div class="w-full md:w-5/12 bg-gray-100 flex-shrink-0">
        <img 
          v-if="manga.coverImage" 
          :src="manga.coverImage" 
          :alt="manga.title" 
          class="w-full h-full object-cover"
        >
        <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
          📚
        </div>
      </div>

      <!-- Details -->
      <div class="w-full md:w-2/3 p-6 overflow-y-auto">
        <div class="mb-4">
          <h2 class="text-3xl font-bold text-gray-900 leading-tight mb-1">{{ manga.title }}</h2>
          <p class="text-xl text-indigo-600 font-semibold">Volume {{ manga.volume }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <span class="block text-gray-500 font-medium">Author</span>
            <span class="text-gray-900 font-semibold">{{ manga.author }}</span>
          </div>
          <div>
            <span class="block text-gray-500 font-medium">Published</span>
            <span class="text-gray-900 font-semibold">{{ manga.publishedYear || 'Unknown' }}</span>
          </div>
          <div>
            <span class="block text-gray-500 font-medium">Price</span>
            <span class="text-gray-900 font-semibold">${{ manga.price }}</span>
          </div>
          <div>
            <span class="block text-gray-500 font-medium">Rental</span>
            <span class="text-gray-900 font-semibold">${{ manga.rentalPrice }} / day</span>
          </div>
          <div class="col-span-2">
            <span class="block text-gray-500 font-medium">Genres</span>
            <div class="flex flex-wrap gap-1 mt-1">
              <span v-for="genre in manga.genre.split(', ')" :key="genre" class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {{ genre }}
              </span>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-bold text-gray-900 mb-2">Synopsis</h3>
          <p class="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
            {{ manga.description || 'No description available.' }}
          </p>
        </div>


      </div>
    </div>
  </div>
</template>
