<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { useCustomerStore } from './stores/customerStore';
import { useMangaStore } from './stores/mangaStore';

const route = useRoute();
const customerStore = useCustomerStore();
const mangaStore = useMangaStore();

const currentModule = computed(() => {
  if (route.path.startsWith('/customers')) return 'Customers';
  if (route.path.startsWith('/mangas')) return 'Mangas';
  if (route.path.startsWith('/rentals')) return 'Rentals';
  if (route.path === '/') return 'Dashboard';
  return '';
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Top Navigation Bar (Odoo Style) -->
    <nav class="bg-purple-900 text-white shadow-md h-14 flex items-center px-6 py-2 justify-between sticky top-0 z-50">
      
      <!-- Left Section: Logo & Apps Button -->
      <div class="flex items-center space-x-4">
        <!-- Apps Button (Home) -->
        <router-link to="/" class="p-1 hover:bg-purple-800 rounded transition-colors" title="Home / Apps">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-300 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </router-link>

        <!-- Brand / Logo -->
        <span class="font-bold text-lg tracking-tight">MangaGo Admin</span>

        <!-- Current Module Breadcrumb -->
        <div v-if="currentModule && currentModule !== 'Dashboard'" class="flex items-center text-sm ml-4 pl-4 border-l border-purple-700">
          <span class="font-medium text-gray-200">{{ currentModule }}</span>
        </div>
      </div>

      <!-- Center Section: Module Menu -->
      <div class="hidden md:flex space-x-6 text-sm font-medium text-gray-300">
        <template v-if="currentModule === 'Customers'">
          <router-link to="/customers" class="hover:text-white transition-colors">List</router-link>
        </template>
        <template v-if="currentModule === 'Mangas'">
          <router-link to="/mangas" class="hover:text-white transition-colors">Inventory</router-link>
        </template>
        <template v-if="currentModule === 'Rentals'">
          <router-link to="/rentals" class="hover:text-white transition-colors">All Rentals</router-link>
          <span class="hover:text-white cursor-not-allowed opacity-50" title="Coming Soon">Overdue</span>
        </template>
      </div>

      <!-- Right Section: User Profile / Search & Filters -->
      <div class="flex items-center space-x-3">
        <!-- Customer Filters and Search -->
        <div class="flex items-center space-x-2" v-if="currentModule === 'Customers'">
          <!-- Status Filters -->
          <div class="flex text-xs space-x-1">
            <button 
              @click="customerStore.statusFilter = 'all'"
              :class="customerStore.statusFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-purple-800 text-purple-300 hover:bg-purple-700'"
              class="px-2 py-1 rounded transition-colors">
              All
            </button>
            <button 
              @click="customerStore.statusFilter = 'renting'"
              :class="customerStore.statusFilter === 'renting' ? 'bg-green-600 text-white' : 'bg-purple-800 text-purple-300 hover:bg-purple-700'"
              class="px-2 py-1 rounded transition-colors">
              Renting
            </button>
            <button 
              @click="customerStore.statusFilter = 'overdue'"
              :class="customerStore.statusFilter === 'overdue' ? 'bg-red-600 text-white' : 'bg-purple-800 text-purple-300 hover:bg-purple-700'"
              class="px-2 py-1 rounded transition-colors">
              Overdue
            </button>
            <button 
              @click="customerStore.statusFilter = 'not-renting'"
              :class="customerStore.statusFilter === 'not-renting' ? 'bg-gray-600 text-white' : 'bg-purple-800 text-purple-300 hover:bg-purple-700'"
              class="px-2 py-1 rounded transition-colors">
              Not Renting
            </button>
          </div>
          <!-- Search Box -->
          <input 
            v-model="customerStore.searchQuery"
            type="text" 
            placeholder="Search..." 
            class="bg-purple-800 text-white text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder-purple-300 border-none w-32 transition-all focus:w-48"
          >
        </div>

        <!-- Manga Filters and Search -->
        <div class="flex items-center space-x-2" v-if="currentModule === 'Mangas'">
          <!-- Price Filter -->
          <select 
            v-model="mangaStore.priceRange"
            class="bg-purple-800 text-white text-xs rounded px-2 py-1 border-none focus:ring-1 focus:ring-purple-400">
            <option value="all">All Prices</option>
            <option value="under10">&lt; $10</option>
            <option value="10to20">$10-$20</option>
            <option value="over20">&gt; $20</option>
          </select>
          <!-- Stock Filter -->
          <select 
            v-model="mangaStore.stockFilter"
            class="bg-purple-800 text-white text-xs rounded px-2 py-1 border-none focus:ring-1 focus:ring-purple-400">
            <option value="all">All Stock</option>
            <option value="inStock">In Stock</option>
            <option value="lowStock">Low Stock</option>
            <option value="outOfStock">Out of Stock</option>
          </select>
          <!-- Status Filter -->
          <select 
            v-model="mangaStore.statusFilter"
            class="bg-purple-800 text-white text-xs rounded px-2 py-1 border-none focus:ring-1 focus:ring-purple-400">
            <option value="all">All Status</option>
            <option value="Publishing">Publishing</option>
            <option value="Finished">Finished</option>
          </select>
          <!-- Genre Filter -->
          <select 
            v-model="mangaStore.genreFilter"
            class="bg-purple-800 text-white text-xs rounded px-2 py-1 border-none focus:ring-1 focus:ring-purple-400">
            <option value="all">All Genres</option>
            <option v-for="genre in mangaStore.availableGenres" :key="genre" :value="genre">{{ genre }}</option>
          </select>
          <!-- Search Box -->
          <input 
            v-model="mangaStore.searchQuery"
            type="text" 
            placeholder="Search..." 
            class="bg-purple-800 text-white text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder-purple-300 border-none w-32 transition-all focus:w-48"
          >
        </div>
        <a href="http://localhost:5173" target="_blank" class="text-xs text-purple-300 hover:text-white transition-colors" title="Open Shop">
          🏪 Shop
        </a>
        <div class="h-8 w-8 rounded-full bg-purple-700 flex items-center justify-center text-xs font-bold border border-purple-600">
          AD
        </div>
      </div>
    </nav>

    <!-- Main Content Area -->
    <main class="flex-grow">
      <router-view></router-view>
    </main>
  </div>
</template>
