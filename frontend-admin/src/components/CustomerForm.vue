<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useCustomerStore } from '../stores/customerStore';
import type { CustomerInput, Customer } from '../types/Customer';

const props = defineProps<{
  customerToEdit?: Customer | null;
}>();

const store = useCustomerStore();
const emit = defineEmits(['close']);

const form = ref<CustomerInput>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  isActive: true,
  address: {
    street: '',
    city: '',
    zip: ''
  }
});

// Initialize form if editing
const initForm = () => {
  if (props.customerToEdit) {
    const { firstName, lastName, email, phone, isActive, address } = props.customerToEdit;
    form.value = {
      firstName,
      lastName,
      email,
      phone: phone || '',
      isActive,
      address: {
        street: address?.street || '',
        city: address?.city || '',
        zip: address?.zip || ''
      }
    };
  } else {
    // Reset
    form.value = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      isActive: true,
      address: { street: '', city: '', zip: '' }
    };
  }
};

watch(() => props.customerToEdit, initForm);
onMounted(initForm);

const handleSubmit = async () => {
  if (props.customerToEdit) {
    await store.updateCustomer(props.customerToEdit._id, form.value);
  } else {
    await store.createCustomer(form.value);
  }
  emit('close');
};
</script>

<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
      
      <!-- Header -->
      <div class="flex justify-between items-center p-5 border-b">
        <h3 class="text-xl font-semibold text-gray-900">
          {{ customerToEdit ? 'Edit Customer' : 'Add New Customer' }}
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500">
          <span class="text-2xl">&times;</span>
        </button>
      </div>

      <!-- Body -->
      <div class="p-6">
        <div v-if="store.error" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span class="block sm:inline">{{ store.error }}</span>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Personal Info -->
            <div>
              <label class="block text-sm font-medium text-gray-700">First Name</label>
              <input v-model="form.firstName" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Last Name</label>
              <input v-model="form.lastName" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input v-model="form.email" type="email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Phone</label>
              <input v-model="form.phone" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2">
            </div>

            <!-- Status -->
            <div class="md:col-span-2 flex items-center mt-2">
              <input v-model="form.isActive" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
              <label class="ml-2 block text-sm text-gray-900">Active User</label>
            </div>

            <!-- Address -->
            <div class="md:col-span-2">
              <h4 class="text-sm font-medium text-gray-500 mb-2 border-b pb-1">Address</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-xs font-medium text-gray-500">Street</label>
                  <input v-model="form.address.street" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2">
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500">City</label>
                  <input v-model="form.address.city" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2">
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500">Zip Code</label>
                  <input v-model="form.address.zip" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2">
                </div>
              </div>
            </div>

            <div class="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" @click="$emit('close')" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                Cancel
              </button>
              <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                {{ customerToEdit ? 'Update Customer' : 'Save Customer' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
