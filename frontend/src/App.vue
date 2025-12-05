<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { useCustomerStore } from './stores/customerStore';

const route = useRoute();
const customerStore = useCustomerStore();

const isAdminRoute = computed(() => route.path.startsWith('/admin'));

const currentModule = computed(() => {
  if (route.path.startsWith('/admin/customers')) return 'Customers';
  if (route.path.startsWith('/admin/mangas')) return 'Mangas';
  if (route.path.startsWith('/admin/rentals')) return 'Rentals';
  if (route.path.startsWith('/admin/pipeline')) return 'Pipeline';
  return '';
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Top Navigation Bar (Odoo Style) - Only show on admin routes -->
    <nav v-if="isAdminRoute" class="bg-purple-900 text-white shadow-md h-12 flex items-center px-4 justify-between sticky top-0 z-50">
      
      <!-- Left Section: Logo & Apps Button -->
      <div class="flex items-center space-x-4">
        <!-- Apps Button (Home) -->
        <router-link to="/admin" class="p-1 hover:bg-purple-800 rounded transition-colors" title="Home / Apps">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-300 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </router-link>

        <!-- Brand / Logo -->
        <span class="font-bold text-lg tracking-tight">MEVN CRM</span>

        <!-- Current Module Breadcrumb -->
        <div v-if="currentModule" class="flex items-center text-sm ml-4 pl-4 border-l border-purple-700">
          <span class="font-medium text-gray-200">{{ currentModule }}</span>
        </div>
      </div>

      <!-- Center Section: Module Menu (Placeholder for now) -->
      <div class="hidden md:flex space-x-6 text-sm font-medium text-gray-300">
        <template v-if="currentModule === 'Customers'">
          <router-link to="/admin/customers" class="hover:text-white transition-colors">List</router-link>
          <span class="hover:text-white cursor-not-allowed opacity-50" title="Coming Soon">Reporting</span>
          <span class="hover:text-white cursor-not-allowed opacity-50" title="Coming Soon">Configuration</span>
        </template>
        <template v-if="currentModule === 'Mangas'">
          <router-link to="/admin/mangas" class="hover:text-white transition-colors">Inventory</router-link>
          <span class="hover:text-white cursor-not-allowed opacity-50" title="Coming Soon">Categories</span>
        </template>
        <template v-if="currentModule === 'Rentals'">
          <router-link to="/admin/rentals" class="hover:text-white transition-colors">All Rentals</router-link>
          <span class="hover:text-white cursor-not-allowed opacity-50" title="Coming Soon">Overdue</span>
        </template>
      </div>

      <!-- Right Section: User Profile / Search -->
      <div class="flex items-center space-x-3">
        <div class="relative" v-if="currentModule === 'Customers'">
          <input 
            v-model="customerStore.searchQuery"
            type="text" 
            placeholder="Search customers..." 
            class="bg-purple-800 text-white text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder-purple-300 border-none w-48 transition-all focus:w-64"
          >
        </div>
        <div class="h-8 w-8 rounded-full bg-purple-700 flex items-center justify-center text-xs font-bold border border-purple-600">
          LD
        </div>
      </div>
    </nav>

    <!-- Main Content Area -->
    <main class="flex-grow">
      <router-view></router-view>
    </main>
  </div>
</template>
