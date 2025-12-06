<script setup lang="ts">
import { onMounted } from 'vue';
import { useCustomerStore } from '../stores/customerStore';
import { storeToRefs } from 'pinia';

const store = useCustomerStore();
const { filteredCustomers, loading } = storeToRefs(store);

onMounted(() => {
  store.fetchCustomers();
});

const deleteCustomer = async (id: string) => {
  if (confirm('Are you sure you want to delete this customer?')) {
    await store.deleteCustomer(id);
  }
};
</script>

<template>
  <div class="bg-white shadow-md rounded-lg overflow-hidden">
    <div v-if="store.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline">{{ store.error }}</span>
      <span class="absolute top-0 bottom-0 right-0 px-4 py-3" @click="store.error = null">
        <svg class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
      </span>
    </div>

    <div v-if="loading" class="p-4 text-center text-gray-500">Loading customers...</div>
    
    <table v-else class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rentals</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="customer in filteredCustomers" :key="customer._id">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">{{ customer.firstName }} {{ customer.lastName }}</div>
            <div class="text-xs text-gray-500">{{ customer.address?.city }}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">{{ customer.email }}</div>
            <div class="text-xs text-gray-500">{{ customer.phone || '-' }}</div>
          </td>
          <td class="px-6 py-4">
            <div class="text-sm text-gray-900">
              <template v-if="customer.rentals && customer.rentals.length > 0">
                <ul class="list-disc list-inside">
                  <li v-for="rental in customer.rentals" :key="rental._id">
                    {{ rental.manga ? rental.manga.title : 'Unknown Manga' }}
                    <span class="text-xs font-semibold ml-1" 
                          :class="{
                            'text-green-600': rental.status === 'ACTIVE',
                            'text-red-600': rental.status === 'LATE',
                            'text-gray-500': rental.status === 'RETURNED'
                          }">
                      ({{ rental.status }})
                    </span>
                  </li>
                </ul>
              </template>
              <span v-else class="text-gray-500">-</span>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
             <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              :class="{
                'bg-green-100 text-green-800': customer.rentals && customer.rentals.some(r => r.status === 'ACTIVE'),
                'bg-red-100 text-red-800': customer.rentals && customer.rentals.some(r => r.status === 'LATE'),
                'bg-gray-100 text-gray-800': !customer.rentals || customer.rentals.every(r => r.status === 'RETURNED')
              }">
              {{ 
                customer.rentals && customer.rentals.some(r => r.status === 'LATE') ? 'Overdue' :
                customer.rentals && customer.rentals.some(r => r.status === 'ACTIVE') ? 'Renting' : 
                'Not Renting' 
              }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button @click="$emit('edit', customer)" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
            <button @click="deleteCustomer(customer._id)" class="text-red-600 hover:text-red-900">Delete</button>
          </td>
        </tr>
        <tr v-if="filteredCustomers.length === 0">
          <td colspan="5" class="px-6 py-4 text-center text-gray-500">
            {{ store.searchQuery ? 'No customers match your search.' : 'No customers found.' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
