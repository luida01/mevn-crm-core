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
          <router-link to="/" class="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Shop</router-link>
          <router-link to="/admin" class="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Admin</router-link>
        </div>
      </div>
    </nav>

    <div class="container mx-auto px-4 py-12">
      <!-- Breadcrumb -->
      <nav class="mb-8">
        <ol class="flex items-center space-x-2 text-sm">
          <li><router-link to="/" class="text-indigo-600 hover:text-indigo-800">Home</router-link></li>
          <li class="text-gray-500">/</li>
          <li class="text-gray-900 dark:text-white font-medium">Rental Policies</li>
        </ol>
      </nav>

      <!-- Page Title -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">📚 Rental Policies</h1>
        <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Learn all the details about our manga rental service.
        </p>
      </div>

      <!-- Content Sections -->
      <div class="max-w-4xl mx-auto space-y-8">
        <!-- Section 1 -->
        <section class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl">📅</span>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Rental Periods</h2>
          </div>
          <div class="text-gray-600 dark:text-gray-400 space-y-4">
            <p>We offer three flexible rental options to match your reading pace:</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div class="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-6 text-center">
                <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">3</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">days</div>
                <div class="mt-2 text-xs text-gray-500">Ideal for quick reads</div>
              </div>
              <div class="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-6 text-center border-2 border-purple-500">
                <div class="text-xs text-purple-600 font-semibold mb-1">MOST POPULAR</div>
                <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">7</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">days</div>
                <div class="mt-2 text-xs text-gray-500">Perfect time to enjoy</div>
              </div>
              <div class="bg-green-50 dark:bg-green-900/30 rounded-xl p-6 text-center">
                <div class="text-3xl font-bold text-green-600 dark:text-green-400">14</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">days</div>
                <div class="mt-2 text-xs text-gray-500">For extended series</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 2 -->
        <section class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl">💰</span>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Pricing & Fees</h2>
          </div>
          <div class="text-gray-600 dark:text-gray-400 space-y-4">
            <ul class="space-y-3">
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-1">✓</span>
                <span>The daily rental price is shown on each manga and varies by title.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-1">✓</span>
                <span>15% discount on 7-day rentals and 25% on 14-day rentals.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-1">✓</span>
                <span>A refundable deposit equal to 50% of the manga value is required.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-yellow-500 mt-1">⚠</span>
                <span>Late fee: $2.00 per day after the due date.</span>
              </li>
            </ul>
          </div>
        </section>

        <!-- Section 3 -->
        <section class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl">📦</span>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Delivery & Pickup</h2>
          </div>
          <div class="text-gray-600 dark:text-gray-400 space-y-4">
            <ul class="space-y-3">
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-1">✓</span>
                <span>Home delivery within 24-48 hours in the capital city.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-1">✓</span>
                <span>Free shipping on orders over $25.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-1">✓</span>
                <span>Free scheduled pickup at the end of your rental.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-1">✓</span>
                <span>Option to pick up and return at our partner stores.</span>
              </li>
            </ul>
          </div>
        </section>

        <!-- Section 4 -->
        <section class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl">📋</span>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Manga Condition</h2>
          </div>
          <div class="text-gray-600 dark:text-gray-400 space-y-4">
            <p>To maintain the quality of our catalog, we ask that you:</p>
            <ul class="space-y-3 mt-4">
              <li class="flex items-start gap-2">
                <span class="text-indigo-500 mt-1">•</span>
                <span>Handle the manga with clean, dry hands.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-indigo-500 mt-1">•</span>
                <span>Do not fold pages or the spine of the manga.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-indigo-500 mt-1">•</span>
                <span>Keep the manga away from food, drinks, and pets.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-indigo-500 mt-1">•</span>
                <span>Store the manga in a dry place when not reading.</span>
              </li>
            </ul>
            <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-6">
              <p class="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>Note:</strong> Damage exceeding normal reading wear may result in additional charges or deposit retention.
              </p>
            </div>
          </div>
        </section>

        <!-- Section 5 -->
        <section class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl">🔄</span>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Extensions & Renewals</h2>
          </div>
          <div class="text-gray-600 dark:text-gray-400 space-y-4">
            <ul class="space-y-3">
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-1">✓</span>
                <span>You can extend your rental up to 2 consecutive times.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-1">✓</span>
                <span>Extensions must be requested before the due date.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-1">✓</span>
                <span>Extensions are charged at the regular daily rate.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-1">✓</span>
                <span>If another customer has reserved the manga, extension may not be available.</span>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <!-- Contact CTA -->
      <div class="mt-16 max-w-4xl mx-auto text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <h2 class="text-2xl font-bold mb-4">Have more questions?</h2>
        <p class="mb-6 opacity-90">Check our FAQ section or contact us directly.</p>
        <div class="flex justify-center gap-4">
          <router-link to="/faq" class="inline-block bg-white text-indigo-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
            View FAQ
          </router-link>
          <a href="mailto:info@mangago.com" class="inline-block border-2 border-white text-white font-bold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">
            Contact Us
          </a>
        </div>
      </div>
    </div>

    <ShopFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import ShopFooter from '../components/ShopFooter.vue';

onMounted(() => {
  window.scrollTo(0, 0);
});
</script>
