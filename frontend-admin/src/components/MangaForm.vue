<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        {{ editManga ? 'Edit Manga' : 'New Manga' }}
      </h2>
      
      <form @submit.prevent="save" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <input v-model="form.title" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Volume</label>
          <div class="flex gap-2">
            <input v-model.number="form.volume" type="number" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <button @click.prevent="fetchCover" type="button" class="mt-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-3 rounded" title="Fetch Cover from MangaDex">
              ✨
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Author</label>
          <input v-model="form.author" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Genre</label>
          <input v-model="form.genre" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock</label>
          <input v-model.number="form.stock" type="number" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Sale Price ($)</label>
          <input v-model.number="form.price" type="number" step="0.01" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Rental Price ($)</label>
          <input v-model.number="form.rentalPrice" type="number" step="0.01" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <!-- Description field removed as per user request -->
        <!-- <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea v-model="form.description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
        </div> -->
        <div class="md:col-span-2 flex justify-end items-center gap-4">
          <img v-if="form.coverImage" :src="form.coverImage" alt="Cover Preview" class="h-16 w-12 object-cover rounded shadow-sm border">
          <button 
            type="button" 
            @click="close"
            class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Cancel
          </button>
          <button 
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {{ editManga ? 'Update Manga' : 'Create Manga' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Manga, MangaInput } from '../types/Manga';
import { useMangaStore } from '../stores/mangaStore';

const props = defineProps<{
  isOpen: boolean;
  editManga: Manga | null;
}>();

const emit = defineEmits(['close', 'save']);
const store = useMangaStore();

const form = ref<MangaInput>({
  title: '',
  volume: 1,
  author: '',
  genre: '',
  price: 0,
  rentalPrice: 0,
  stock: 0,
  description: '',
  coverImage: '',
  status: '',
  malScore: undefined,
  malId: undefined
});

watch(() => props.editManga, (newManga) => {
  if (newManga) {
    form.value = {
      title: newManga.title,
      volume: newManga.volume,
      author: newManga.author,
      genre: newManga.genre,
      price: newManga.price,
      rentalPrice: newManga.rentalPrice,
      stock: newManga.stock,
      description: newManga.description || '',
      coverImage: newManga.coverImage || '',
      status: newManga.status || '',
      malScore: newManga.malScore,
      malId: newManga.malId
    };
  } else {
    // Reset form
    form.value = {
      title: '',
      volume: 1,
      author: '',
      genre: '',
      price: 0,
      rentalPrice: 0,
      stock: 0,
      description: '',
      coverImage: '',
      status: '',
      malScore: undefined,
      malId: undefined
    };
  }
}, { immediate: true });

const close = () => {
  emit('close');
};

const save = () => {
  emit('save', { ...form.value });
};

const fetchCover = async () => {
  if (!form.value.title) return;
  const coverUrl = await store.fetchCover(form.value.title, form.value.volume, form.value.author);
  if (coverUrl) {
    form.value.coverImage = coverUrl;
  }
  // If not found, keep the existing one (e.g. from MAL import)
};

// Auto-fetch cover when volume changes
let debounceTimer: any = null;
watch(() => form.value.volume, (newVal) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (newVal && form.value.title) {
      fetchCover();
    }
  }, 500); // 500ms debounce
});
</script>
