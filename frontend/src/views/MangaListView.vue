<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useMangaStore } from '../stores/mangaStore';
import { storeToRefs } from 'pinia';
import type { MangaInput, Manga } from '../types/Manga';
import MangaImportModal from '../components/MangaImportModal.vue';
import MangaDetailsModal from '../components/MangaDetailsModal.vue';
import MangaForm from '../components/MangaForm.vue';
import MangaEditModal from '../components/MangaEditModal.vue';

const store = useMangaStore();
const { loading, error } = storeToRefs(store);

const showImportModal = ref(false);
const showDetailsModal = ref(false);
const selectedManga = ref<Manga | null>(null);
const searchQuery = ref('');

// Edit Modal State
const isEditModalOpen = ref(false);
const editingMangaPrices = ref<Manga | null>(null);

// Edit/Create Manga Form State
const isModalOpen = ref(false);
const editingManga = ref<Manga | null>(null);

onMounted(() => {
  store.fetchMangas();
});

const filteredMangas = computed(() => {
  if (!searchQuery.value) return store.mangas;
  const lowerQuery = searchQuery.value.toLowerCase();
  return store.mangas.filter(m => 
    m.title.toLowerCase().includes(lowerQuery) || 
    m.author.toLowerCase().includes(lowerQuery)
  );
});

const handleImport = (manga: MangaInput) => {
  // Open modal with imported data (treated as new entry since no ID)
  editingManga.value = { ...manga, price: 0, rentalPrice: 0, stock: 0 } as Manga;
  isModalOpen.value = true;
};

const openDetails = (manga: Manga) => {
  selectedManga.value = manga;
  showDetailsModal.value = true;
};

const deleteManga = async (id: string) => {
  if (confirm('Are you sure you want to delete this manga?')) {
    await store.deleteManga(id);
  }
};

const handleImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Cover';
};

// --- Edit Prices Modal ---
const openEditModal = (manga: Manga) => {
  editingMangaPrices.value = manga;
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  editingMangaPrices.value = null;
};

const handlePriceUpdate = async (prices: { rentalPrice: number, price: number }) => {
  if (editingMangaPrices.value && editingMangaPrices.value._id) {
    await store.updateManga(editingMangaPrices.value._id, prices);
    closeEditModal();
  }
};

// --- Add Stock ---
const addStock = async (manga: Manga) => {
  const quantity = prompt(`Add stock for "${manga.title}":`, '1');
  if (quantity && !isNaN(parseInt(quantity))) {
    const newStock = manga.stock + parseInt(quantity);
    if (manga._id) {
        await store.updateManga(manga._id, { stock: newStock });
    }
  }
};

// --- Full Edit/Create Form ---
const closeModal = () => {
  isModalOpen.value = false;
  editingManga.value = null;
};

const handleSave = async (mangaData: Partial<Manga>) => {
  console.log('Saving manga data (handleSave):', mangaData);
  if (editingManga.value?._id) {
    await store.updateManga(editingManga.value._id, mangaData);
  } else {
    await store.createManga(mangaData as Manga);
  }
  await store.fetchMangas(); // Force refresh to ensure data is correct
  closeModal();
};
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Manga Inventory</h1>
      <div class="flex gap-2">
        <div class="relative">
            <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Search manga..." 
                class="border rounded px-3 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
            <svg class="w-4 h-4 absolute left-2.5 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
        </div>
        <button @click="showImportModal = true" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
          <span class="mr-2">Add Manga</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p class="mt-2 text-gray-500 dark:text-gray-400">Loading inventory...</p>
    </div>

    <!-- Manga Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="manga in filteredMangas" :key="manga._id" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col cursor-pointer hover:shadow-xl transition-all duration-300" @click="openDetails(manga)">
        <div class="relative h-96 bg-gray-200 dark:bg-gray-700 group">
           <img 
             v-if="manga.coverImage" 
             :src="manga.coverImage" 
             :alt="manga.title" 
             class="w-full h-full object-contain bg-gray-900 transition-transform duration-500 group-hover:scale-105" 
             @error="handleImageError"
           >
           <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
             📚
           </div>
           
           <!-- Action Buttons Overlay -->
           <div class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button @click.stop="openEditModal(manga)" class="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg transform hover:scale-110 transition-transform" title="Edit Prices">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button @click.stop="addStock(manga)" class="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 shadow-lg transform hover:scale-110 transition-transform" title="Add Stock">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button @click.stop="deleteManga(manga._id!)" class="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg transform hover:scale-110 transition-transform" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
           </div>
        </div>
        <div class="p-4 flex-1 flex flex-col">
          <div class="flex justify-between items-start mb-2">
             <h3 class="text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">{{ manga.title }}</h3>
             <div class="flex gap-2 items-center whitespace-nowrap ml-2">
               <span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Vol. {{ manga.volume }}</span>
               <span v-if="manga.status" :class="manga.status === 'Finished' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'" class="px-2 py-0.5 rounded text-xs font-medium">
                 {{ manga.status }}
               </span>
             </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ manga.author }}</p>
          <div class="mt-auto flex justify-between items-center text-sm pt-3 border-t border-gray-100 dark:border-gray-700">
             <span :class="manga.stock > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'" class="px-2 py-1 rounded text-xs font-medium">
               Stock: {{ manga.stock }}
             </span>
             <div class="text-right">
               <div class="text-gray-900 dark:text-white font-medium">Rent: ${{ manga.rentalPrice }}</div>
               <div class="text-gray-500 dark:text-gray-400 text-xs">Buy: ${{ manga.price }}</div>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <MangaForm 
      :is-open="isModalOpen" 
      :edit-manga="editingManga"
      @close="closeModal" 
      @save="handleSave" 
    />

    <MangaEditModal
      :is-open="isEditModalOpen"
      :manga="editingMangaPrices"
      @close="closeEditModal"
      @save="handlePriceUpdate"
    />
  </div>
</template>
