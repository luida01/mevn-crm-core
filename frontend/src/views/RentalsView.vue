<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRentalStore } from '../stores/rentalStore';
import RentalForm from '../components/RentalForm.vue';

const store = useRentalStore();
const showForm = ref(false);

onMounted(() => {
  store.fetchRentals();
});

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
};

const handleReturn = async (id: string) => {
  if (confirm('Mark this rental as returned?')) {
    await store.returnRental(id);
  }
};
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Rentals</h1>
        <p class="mt-2 text-sm text-gray-700">Manage manga rentals.</p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button @click="showForm = true" type="button" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">
          New Rental
        </button>
      </div>
    </div>

    <div v-if="showForm">
      <RentalForm @close="showForm = false" />
    </div>

    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Manga</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Due Date</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Payment</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="rental in store.rentals" :key="rental._id">
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div class="font-medium text-gray-900">{{ rental.customer?.firstName }} {{ rental.customer?.lastName }}</div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ rental.manga?.title }} (Vol. {{ rental.manga?.volume }})
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ formatDate(rental.dueDate) }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
                      :class="{
                        'bg-green-100 text-green-800': rental.status === 'ACTIVE',
                        'bg-gray-100 text-gray-800': rental.status === 'RETURNED',
                        'bg-red-100 text-red-800': rental.status === 'LATE'
                      }">
                      {{ rental.status }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <button 
                      @click="store.togglePayment(rental._id)"
                      class="inline-flex rounded-full px-2 text-xs font-semibold leading-5 cursor-pointer hover:opacity-80"
                      :class="rental.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                    >
                      {{ rental.isPaid ? 'Paid' : 'Unpaid' }}
                    </button>
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button v-if="rental.status === 'ACTIVE' || rental.status === 'LATE'" 
                            @click="handleReturn(rental._id)" 
                            class="text-indigo-600 hover:text-indigo-900">
                      Return
                    </button>
                    <span v-else class="text-gray-400">Returned</span>
                  </td>
                </tr>
                <tr v-if="store.rentals.length === 0">
                    <td colspan="5" class="px-3 py-4 text-sm text-gray-500 text-center">No rentals found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
