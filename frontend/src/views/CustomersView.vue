<script setup lang="ts">
import { ref } from 'vue';
import CustomerList from '../components/CustomerList.vue';
import CustomerForm from '../components/CustomerForm.vue';
import type { Customer } from '../types/Customer';

const showForm = ref(false);
const editingCustomer = ref<Customer | null>(null);

const handleEdit = (customer: Customer) => {
  editingCustomer.value = customer;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingCustomer.value = null;
};
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Customers</h1>
        <p class="mt-2 text-sm text-gray-700">A list of all the customers in your account including their name, title, email and role.</p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button @click="showForm = !showForm" type="button" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">
          {{ showForm ? 'Hide Form' : 'Add Customer' }}
        </button>
      </div>
    </div>
    
    <div v-if="showForm" class="mt-8">
      <CustomerForm :customerToEdit="editingCustomer" @close="closeForm" />
    </div>

    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <CustomerList @edit="handleEdit" />
        </div>
      </div>
    </div>
  </div>
</template>
