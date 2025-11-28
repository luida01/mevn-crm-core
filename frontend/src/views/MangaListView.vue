<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useMangaStore } from '../stores/mangaStore';
import { storeToRefs } from 'pinia';
import type { MangaInput, Manga } from '../types/Manga';
import MangaImportModal from '../components/MangaImportModal.vue';
import MangaDetailsModal from '../components/MangaDetailsModal.vue';

const store = useMangaStore();
const { filteredMangas, loading, error } = storeToRefs(store);

const showForm = ref(false);
const showImportModal = ref(false);
const showDetailsModal = ref(false);
const selectedManga = ref<Manga | null>(null);

const newManga = ref<MangaInput>({
  title: '',
  volume: 1,
  author: '',
  genre: '',
  price: 0,
  rentalPrice: 0,
  stock: 0,
  description: '',
  coverImage: ''
});

onMounted(() => {
  store.fetchMangas();
});

const handleImport = (manga: MangaInput) => {
  newManga.value = { ...manga, price: 0, rentalPrice: 0, stock: 0 };
  showForm.value = true;
};

const handleSubmit = async () => {
  await store.createManga(newManga.value);
  showForm.value = false;
  // Reset form
  newManga.value = { title: '', volume: 1, author: '', genre: '', price: 0, rentalPrice: 0, stock: 0, description: '', coverImage: '' };
};

const fetchCover = async () => {
  if (!newManga.value.title) return;
  loading.value = true; // Reuse loading state or create a local one
  const coverUrl = await store.fetchCover(newManga.value.title, newManga.value.volume);
  if (coverUrl) {
    newManga.value.coverImage = coverUrl;
  } else {
    alert('Cover not found on MangaDex for this volume.');
  }
  loading.value = false;
};

const openDetails = (manga: Manga) => {
  selectedManga.value = manga;
  showDetailsModal.value = true;
};

const handleEdit = (manga: Manga) => {
  // Placeholder for edit functionality
  alert(`Edit feature for ${manga.title} coming soon!`);
};
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-800">Manga Inventory</h1>
      <div class="flex gap-2">
        <button @click="showImportModal = true" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
          <span class="mr-2">Import from MAL</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        <button @click="showForm = !showForm" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
          <span class="mr-2">{{ showForm ? 'Cancel' : 'Add Manually' }}</span>
          <svg v-if="!showForm" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <MangaImportModal v-if="showImportModal" @close="showImportModal = false" @select="handleImport" />
    <MangaDetailsModal v-if="showDetailsModal && selectedManga" :manga="selectedManga" @close="showDetailsModal = false" />

    <!-- Error Alert -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <!-- Add Manga Form -->
    <div v-if="showForm" class="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">New Manga</h3>
      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Title</label>
          <input v-model="newManga.title" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Volume</label>
          <div class="flex gap-2">
            <input v-model.number="newManga.volume" type="number" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2">
            <button @click.prevent="fetchCover" type="button" class="mt-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-3 rounded" title="Fetch Cover from MangaDex">
              ✨
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Author</label>
          <input v-model="newManga.author" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Genre</label>
          <input v-model="newManga.genre" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Stock</label>
          <input v-model.number="newManga.stock" type="number" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Sale Price ($)</label>
          <input v-model.number="newManga.price" type="number" step="0.01" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Rental Price ($)</label>
          <input v-model.number="newManga.rentalPrice" type="number" step="0.01" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2">
        </div>
        <div class="md:col-span-2 flex justify-end items-center gap-4">
          <img v-if="newManga.coverImage" :src="newManga.coverImage" alt="Cover Preview" class="h-16 w-12 object-cover rounded shadow-sm border">
          <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">Save Manga</button>
        </div>
      </form>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p class="mt-2 text-gray-500">Loading inventory...</p>
    </div>

    <!-- Manga Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      <div v-for="manga in filteredMangas" :key="manga._id" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer" @click="openDetails(manga)">
        <!-- Cover Image with Aspect Ratio -->
        <div class="aspect-[2/3] w-full bg-gray-200 relative overflow-hidden group">
          <img 
            v-if="manga.coverImage" 
            :src="manga.coverImage" 
            :alt="manga.title" 
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          >
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
            📚
          </div>
          <!-- Overlay for quick actions (optional) -->
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
        </div>

        <div class="p-4 flex flex-col flex-1">
          <!-- Title & Volume -->
          <div class="mb-2">
            <h3 class="text-base font-bold text-gray-900 leading-tight line-clamp-2" :title="manga.title">
              {{ manga.title }}
            </h3>
            <span class="text-xs font-semibold text-indigo-600">Vol. {{ manga.volume }}</span>
          </div>

          <p class="text-xs text-gray-500 mb-3 line-clamp-1">{{ manga.author }}</p>

          <div class="mt-auto">
            <div class="flex justify-between items-end mb-3 gap-2">
              <span class="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded line-clamp-1 flex-1 text-center">{{ manga.genre.split(',')[0] }}</span>
              <span class="text-sm font-bold text-gray-900 whitespace-nowrap">${{ manga.price }}</span>
            </div>
            
            <div class="flex justify-between items-center pt-3 border-t border-gray-100">
              <span :class="manga.stock > 0 ? 'text-green-600' : 'text-red-600'" class="text-xs font-medium flex items-center">
                <span class="w-2 h-2 rounded-full mr-1" :class="manga.stock > 0 ? 'bg-green-500' : 'bg-red-500'"></span>
                {{ manga.stock > 0 ? 'In Stock' : 'Out' }}
              </span>
              <div class="flex gap-2">
                <button @click.stop="handleEdit(manga)" class="text-gray-400 hover:text-indigo-500 transition-colors p-1" title="Edit">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button @click.stop="store.deleteManga(manga._id!)" class="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
