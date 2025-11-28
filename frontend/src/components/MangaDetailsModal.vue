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

        <div class="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <!-- Stock Status (Bottom Left) -->
          <div :class="manga.stock > 0 ? 'text-green-600' : 'text-red-600'" class="font-bold flex items-center text-lg">
            <span class="w-3 h-3 rounded-full mr-2" :class="manga.stock > 0 ? 'bg-green-500' : 'bg-red-500'"></span>
            {{ manga.stock > 0 ? `${manga.stock} Available` : 'Out of Stock' }}
          </div>

          <!-- Actions (Bottom Right) -->
          <div class="flex flex-wrap gap-3">
            <!-- Notify Me (Only when out of stock) -->
            <button v-if="manga.stock <= 0" class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded shadow transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              Notify Me
            </button>

            <!-- Rent Button -->
            <button 
              v-if="manga.stock > 0"
              class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded shadow transition-colors flex flex-col items-center min-w-[100px]"
            >
              <span>Rent</span>
              <span class="text-xs font-normal opacity-90">${{ manga.rentalPrice }} / day</span>
            </button>

            <!-- Buy Button -->
            <button 
              v-if="manga.stock > 0"
              class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow transition-colors flex flex-col items-center min-w-[100px]"
            >
              <span>Buy</span>
              <span class="text-xs font-normal opacity-90">${{ manga.price }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
