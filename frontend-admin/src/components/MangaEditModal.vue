<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
      <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Manga Prices</h2>
      
      <form @submit.prevent="save">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rental Price</label>
          <input 
            v-model.number="form.rentalPrice" 
            type="number" 
            step="0.01"
            class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sale Price</label>
          <input 
            v-model.number="form.price" 
            type="number" 
            step="0.01"
            class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <div class="flex justify-end gap-2">
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
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Manga } from '../types/Manga';

const props = defineProps<{
  isOpen: boolean;
  manga: Manga | null;
}>();

const emit = defineEmits(['close', 'save']);

const form = ref({
  rentalPrice: 0,
  price: 0
});

watch(() => props.manga, (newManga) => {
  if (newManga) {
    form.value = {
      rentalPrice: newManga.rentalPrice,
      price: newManga.price
    };
  }
}, { immediate: true });

const close = () => {
  emit('close');
};

const save = () => {
  emit('save', { ...form.value });
  close();
};
</script>
