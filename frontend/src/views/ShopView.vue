<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header/Navbar -->
    <nav class="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <img src="/logo.png" alt="MangaGo" class="h-12">
          <span class="text-2xl font-bold text-gray-900 dark:text-white">MangaGo</span>
        </div>
        <div class="flex gap-6 items-center">
          <a href="/" class="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Shop</a>
          <a href="/admin" class="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Admin</a>
          <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Log in
          </button>
        </div>
      </div>
    </nav>

    <div class="container mx-auto px-4 py-12">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          We curate simple and timeless <span class="text-indigo-600 dark:text-indigo-400">Manga</span>, so you can <span class="font-black">Read brighter.</span>
        </h1>
      </div>

      <!-- Top Rated Carousel -->
      <section class="mb-16">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Trending Now</h2>
        <MangaCarousel v-if="store.topRated.length > 0" :mangas="store.topRated" />
        <div v-else class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </section>

      <!-- Recent Arrivals -->
      <section class="mb-16">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">New Arrivals</h2>
        <div v-if="store.loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div 
            v-for="manga in store.recentArrivals" 
            :key="manga._id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
          >
            <div class="relative overflow-hidden rounded-t-lg">
              <img 
                :src="manga.coverImage || '/placeholder.jpg'" 
                :alt="manga.title"
                class="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-300"
              >
              <div v-if="manga.malScore" class="absolute top-2 right-2 bg-yellow-400 text-gray-900 font-bold px-2 py-1 rounded-full text-xs shadow-lg">
                ⭐ {{ manga.malScore.toFixed(1) }}
              </div>
            </div>
            <div class="p-4">
              <h4 class="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">{{ manga.title }}</h4>
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">{{ manga.author }}</p>
              <div class="flex justify-between items-center text-xs">
                <span class="text-indigo-600 dark:text-indigo-400 font-semibold">${{ manga.rentalPrice }}/day</span>
                <span class="text-green-600 dark:text-green-400 font-semibold">${{ manga.price }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Rental Info Section -->
      <section class="mb-16">
        <RentalInfoSection />
      </section>

      <!-- Thematic Collections -->
      <section class="mb-16">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Thematic Collections</h2>
        
        <ThematicCollection 
          title="Getting Started with Manga"
          :mangas="store.collections.beginner"
          :loading="store.loading"
        />
        
        <ThematicCollection 
          title="Adapted to Current Anime"
          :mangas="store.collections.animeAdaptations"
          :loading="store.loading"
        />
        
        <ThematicCollection 
          title="Horror Masterpieces for the Night"
          :mangas="store.collections.horror"
          :loading="store.loading"
        />
      </section>

      <!-- Author Collections -->
      <section class="mb-16">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Author Collections</h2>
        <div v-if="store.loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div 
            v-for="author in topAuthors" 
            :key="author._id"
            @click="loadAuthorCollection(author._id)"
            class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer p-6 text-center text-white"
          >
            <div class="text-4xl mb-2">📚</div>
            <h4 class="font-bold text-sm mb-1">{{ author._id }}</h4>
            <p class="text-xs opacity-90">{{ author.count }} titles</p>
            <p v-if="author.avgScore" class="text-xs mt-1">⭐ {{ author.avgScore.toFixed(1) }}</p>
          </div>
        </div>
      </section>

      <!-- Community Rankings -->
      <section class="mb-16">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">What's the Community Reading?</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Most Read This Week -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">📖 Most Read This Week</h3>
            <div v-if="store.loading" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
            <div v-else class="space-y-3">
              <div 
                v-for="(manga, index) in mostReadWeek" 
                :key="manga._id"
                class="flex gap-3 items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400 w-8">{{ index + 1 }}</div>
                <img :src="manga.coverImage || '/placeholder.jpg'" :alt="manga.title" class="w-12 h-16 object-cover rounded shadow-sm">
                <div class="flex-1">
                  <h4 class="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{{ manga.title }}</h4>
                  <p class="text-xs text-gray-600 dark:text-gray-400">{{ manga.author }}</p>
                </div>
                <div v-if="manga.malScore" class="text-yellow-500 text-sm font-bold">⭐ {{ manga.malScore.toFixed(1) }}</div>
              </div>
            </div>
          </div>

          <!-- Most Rented Today -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">🔥 Most Rented Today</h3>
            <div v-if="store.loading" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
            <div v-else class="space-y-3">
              <div 
                v-for="(manga, index) in mostRentedToday" 
                :key="manga._id"
                class="flex gap-3 items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <div class="text-2xl font-bold text-green-600 dark:text-green-400 w-8">{{ index + 1 }}</div>
                <img :src="manga.coverImage || '/placeholder.jpg'" :alt="manga.title" class="w-12 h-16 object-cover rounded shadow-sm">
                <div class="flex-1">
                  <h4 class="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{{ manga.title }}</h4>
                  <p class="text-xs text-gray-600 dark:text-gray-400">{{ manga.author }}</p>
                </div>
                <div class="text-indigo-600 dark:text-indigo-400 text-sm font-bold">${{ manga.rentalPrice }}/day</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Footer -->
    <ShopFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useShopStore } from '../stores/shopStore';
import MangaCarousel from '../components/MangaCarousel.vue';
import RentalInfoSection from '../components/RentalInfoSection.vue';
import ThematicCollection from '../components/ThematicCollection.vue';
import ShopFooter from '../components/ShopFooter.vue';
import api from '../services/api';

const store = useShopStore();
const topAuthors = ref<any[]>([]);
const mostReadWeek = ref<any[]>([]);
const mostRentedToday = ref<any[]>([]);

const loadAuthorCollection = async (author: string) => {
  // TODO: Implement author collection modal or navigation
  console.log('Load collection for:', author);
};

onMounted(async () => {
  await Promise.all([
    store.fetchTopRated(10),
    store.fetchRecentArrivals(6), // Changed to 6
    store.fetchCollection('beginner'),
    store.fetchCollection('anime-adaptations'),
    store.fetchCollection('horror')
    // Removed 'complete' collection
  ]);

  // Fetch top authors
  try {
    const authorsRes = await api.get('/shop/top-authors?limit=6');
    topAuthors.value = authorsRes.data;
  } catch (err) {
    console.error('Error fetching top authors:', err);
  }

  // Fetch community rankings
  try {
    const [weekRes, todayRes] = await Promise.all([
      api.get('/shop/most-read-week?limit=10'),
      api.get('/shop/most-rented-today?limit=10')
    ]);
    mostReadWeek.value = weekRes.data;
    mostRentedToday.value = todayRes.data;
  } catch (err) {
    console.error('Error fetching rankings:', err);
  }
});
</script>
