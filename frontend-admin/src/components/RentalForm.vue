<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRentalStore } from '../stores/rentalStore';
import { useCustomerStore } from '../stores/customerStore';
import { useMangaStore } from '../stores/mangaStore';

const emit = defineEmits(['close']);

const rentalStore = useRentalStore();
const customerStore = useCustomerStore();
const mangaStore = useMangaStore();

const form = ref({
  customerId: '',
  mangaId: '',
  dueDate: ''
});

onMounted(() => {
  customerStore.fetchCustomers();
  mangaStore.fetchMangas();
});

// Filter available mangas (stock > 0)
const availableMangas = computed(() => {
  return mangaStore.mangas.filter(m => m.stock > 0);
});

const handleSubmit = async () => {
  try {
    await rentalStore.createRental(form.value);
    emit('close');
  } catch (error) {
    // Error handled in store
  }
};
</script>

<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md">
      
      <div class="flex justify-between items-center p-5 border-b">
        <h3 class="text-xl font-semibold text-gray-900">New Rental</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500">
          <span class="text-2xl">&times;</span>
        </button>
      </div>

      <div class="p-6">
        <div v-if="rentalStore.error" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span class="block sm:inline">{{ rentalStore.error }}</span>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Customer</label>
              <select v-model="form.customerId" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2">
                <option value="" disabled>Select a customer</option>
                <option v-for="customer in customerStore.customers" :key="customer._id" :value="customer._id">
                  {{ customer.firstName }} {{ customer.lastName }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Manga</label>
              <select v-model="form.mangaId" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2">
                <option value="" disabled>Select a manga</option>
                <option v-for="manga in availableMangas" :key="manga._id" :value="manga._id">
                  {{ manga.title }} (Vol. {{ manga.volume }}) - Stock: {{ manga.stock }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Due Date</label>
              <input v-model="form.dueDate" type="date" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2">
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button type="button" @click="$emit('close')" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                Cancel
              </button>
              <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                Create Rental
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
