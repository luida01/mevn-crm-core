<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
    <h2 class="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Rental vs Purchase</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Benefits of Rental -->
      <div class="text-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl">
        <div class="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Rental Benefits</h3>
        <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left">
          <li>✓ Try before you buy</li>
          <li>✓ Save money</li>
          <li>✓ Read more manga</li>
          <li>✓ No commitment</li>
        </ul>
      </div>

      <!-- Pricing -->
      <div class="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl">
        <div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pricing</h3>
        <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left">
          <li>📖 $5-10 / day</li>
          <li>📚 Volume discounts</li>
          <li>🎁 Weekly promotions</li>
          <li>⭐ Loyalty program</li>
        </ul>
      </div>

      <!-- Return Process -->
      <div class="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl">
        <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">How to Return</h3>
        <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left">
          <li>1. Notify your return</li>
          <li>2. Pack carefully</li>
          <li>3. Drop off in store</li>
          <li>4. Instant confirmation</li>
        </ul>
      </div>

      <!-- Rental vs Purchase -->
      <div class="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl">
        <div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Differences</h3>
        <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left">
          <li>🔄 Rental: Temporary</li>
          <li>💰 Purchase: Yours forever</li>
          <li>📦 Rental: Return it</li>
          <li>🏠 Purchase: Collect it</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props or state needed for this static component
</script>
