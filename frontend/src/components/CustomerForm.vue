<script setup lang="ts">
import { ref } from 'vue';
import { useCustomerStore } from '../stores/customerStore';
import type { CustomerInput } from '../types/Customer';

const store = useCustomerStore();
const emit = defineEmits(['close']);

const form = ref<CustomerInput>({
  name: '',
  email: '',
  phone: '',
  company: '',
  status: 'prospect',
  notes: ''
});

const handleSubmit = async () => {
  await store.createCustomer(form.value);
  // Reset form
  form.value = { name: '', email: '', phone: '', company: '', status: 'prospect', notes: '' };
  emit('close');
};
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Add New Customer</h3>
    
    <div v-if="store.error" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <span class="block sm:inline">{{ store.error }}</span>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Name</label>
          <input v-model="form.name" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input v-model="form.email" type="email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Company</label>
          <input v-model="form.company" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Status</label>
          <select v-model="form.status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
            <option value="prospect">Prospect</option>
            <option value="lead">Lead</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div class="flex justify-end">
          <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Save Customer
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
