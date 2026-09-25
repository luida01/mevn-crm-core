<script setup lang="ts">
import { ref } from 'vue';
import { useMangaStore } from '../stores/mangaStore';
import type { MangaInput, RemoteMangaResult } from '../types/Manga';

const store = useMangaStore();
const emit = defineEmits(['close', 'select']);

const searchQuery = ref('');
const results = ref<RemoteMangaResult[]>([]);
const searching = ref(false);
const hasSearched = ref(false);

const handleSearch = async () => {
  const query = searchQuery.value.trim();
  if (!query) return;
  searching.value = true;
  hasSearched.value = true;
  try {
    results.value = await store.searchRemoteMangas(query);
  } finally {
    searching.value = false;
  }
};

const selectManga = (manga: RemoteMangaResult) => {
  const formattedManga: MangaInput = {
    title: manga.title,
    volume: 1, // Default volume
    author: manga.author,
    genre: manga.genre,
    description: manga.description,
    coverImage: manga.coverImage || undefined,
    publishedYear: manga.publishedYear ?? undefined,
    status: manga.status, // Publication status
    malScore: manga.malScore ?? undefined,
    malId: manga.malId ?? undefined,
    mangaDexId: manga.mangaDexId,
    price: 0,
    rentalPrice: 0,
    stock: 0
  };
  emit('select', formattedManga);
  emit('close');
};

const handleImageError = (event: Event) => {
  const image = event.currentTarget as HTMLImageElement;
  image.onerror = null;
  image.src = '/no-cover.svg';
};
</script>

<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-4xl m-4 flex flex-col max-h-[90vh]">
      
      <!-- Header -->
      <div class="flex justify-between items-center p-5 border-b">
        <h3 class="text-xl font-semibold text-gray-900">Import from MyAnimeList</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500">
          <span class="text-2xl">&times;</span>
        </button>
      </div>

      <!-- Search Bar -->
      <div class="p-5 border-b bg-gray-50">
        <p class="text-sm text-gray-600 mb-3">Searches MyAnimeList when available and uses MangaDex as a backup source.</p>
        <form @submit.prevent="handleSearch" class="flex gap-2">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search manga (e.g. Naruto, Berserk)..." 
            class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
            autofocus
          >
          <button 
            type="submit" 
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            :disabled="searching"
          >
            {{ searching ? 'Searching...' : 'Search' }}
          </button>
        </form>
      </div>

      <!-- Results -->
      <div class="flex-1 overflow-y-auto p-5">
        <div v-if="searching" class="text-center text-gray-500 py-10" role="status">
          Searching manga catalogs...
        </div>
        <div v-else-if="store.error" class="text-center text-red-600 py-10" role="alert">
          {{ store.error }}
        </div>
        <div v-else-if="hasSearched && results.length === 0" class="text-center text-gray-500 py-10">
          No manga found. Try another title.
        </div>
        <div v-else-if="!hasSearched" class="text-center text-gray-500 py-10">
          Type a name and hit search to find mangas.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="manga in results" 
            :key="manga.malId || manga.mangaDexId || manga.title"
            class="border rounded-lg p-4 flex gap-4 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="selectManga(manga)"
          >
            <img :src="manga.coverImage || '/no-cover.svg'" :alt="manga.title" class="w-24 h-36 object-cover rounded shadow-sm" @error="handleImageError">
            <div class="flex-1">
              <h4 class="font-bold text-lg text-gray-900">{{ manga.title }}</h4>
              <span class="text-xs text-gray-500">{{ manga.provider }}</span>
              <p class="text-sm text-gray-600 mb-1">{{ manga.author }}</p>
              <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">{{ manga.genre }}</span>
              <p class="text-xs text-gray-500 line-clamp-3">{{ manga.description }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
