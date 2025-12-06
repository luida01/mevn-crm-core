<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const apps = [
  { name: 'Customers', icon: '👥', route: '/customers', color: 'bg-blue-500' },
  { name: 'Mangas', icon: '📚', route: '/mangas', color: 'bg-orange-500' },
  { name: 'Rentals', icon: '📖', route: '/rentals', color: 'bg-indigo-500' },
  { name: 'Pipeline', icon: '📊', route: '/pipeline', color: 'bg-purple-500', disabled: true },
  { name: 'Invoicing', icon: '💰', route: '/invoicing', color: 'bg-green-500', disabled: true },
  { name: 'Settings', icon: '⚙️', route: '/settings', color: 'bg-gray-500', disabled: true },
];

const navigateTo = (route: string) => {
  router.push(route);
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl font-light text-gray-600 mb-8">Apps</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div 
          v-for="app in apps" 
          :key="app.name"
          @click="!app.disabled && navigateTo(app.route)"
          class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6 flex flex-col items-center justify-center aspect-square group"
          :class="{ 'opacity-50 cursor-not-allowed': app.disabled }"
        >
          <div :class="`w-16 h-16 rounded-lg ${app.color} flex items-center justify-center text-3xl text-white mb-4 shadow-sm group-hover:scale-110 transition-transform`">
            {{ app.icon }}
          </div>
          <span class="text-gray-700 font-medium">{{ app.name }}</span>
          <span v-if="app.disabled" class="text-xs text-gray-400 mt-1">(Coming Soon)</span>
        </div>
      </div>
    </div>
  </div>
</template>
