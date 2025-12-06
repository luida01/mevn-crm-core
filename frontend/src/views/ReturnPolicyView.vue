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
          <li class="text-gray-900 dark:text-white font-medium">Return Policy</li>
        </ol>
      </nav>

      <!-- Page Title -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">↩️ Return Policy</h1>
        <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Complete information about returns, refunds, and exchanges.
        </p>
      </div>

      <!-- Content Sections -->
      <div class="max-w-4xl mx-auto space-y-8">
        <!-- Section 1 -->
        <section class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl">📦</span>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Rental Returns</h2>
          </div>
          <div class="text-gray-600 dark:text-gray-400 space-y-4">
            <p>The return process for rented manga is simple and convenient:</p>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mt-6">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Return Process:</h3>
              <ol class="space-y-4">
                <li class="flex gap-4">
                  <span class="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">Schedule your pickup</p>
                    <p class="text-sm">Log into your account and select the "Schedule Return" option.</p>
                  </div>
                </li>
                <li class="flex gap-4">
                  <span class="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">Prepare the manga</p>
                    <p class="text-sm">Make sure the manga is in good condition and packaged.</p>
                  </div>
                </li>
                <li class="flex gap-4">
                  <span class="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">Home pickup</p>
                    <p class="text-sm">Our courier will pick up the manga at the agreed time.</p>
                  </div>
                </li>
                <li class="flex gap-4">
                  <span class="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">✓</span>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">Confirmation</p>
                    <p class="text-sm">You will receive an email confirming the return and the status of your deposit.</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </section>

        <!-- Section 2 -->
        <section class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl">🛒</span>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Purchase Returns</h2>
          </div>
          <div class="text-gray-600 dark:text-gray-400 space-y-4">
            <p>For purchased manga, we offer the following options:</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div class="bg-green-50 dark:bg-green-900/30 rounded-xl p-6">
                <h3 class="font-bold text-green-700 dark:text-green-400 mb-3">✓ We accept returns if:</h3>
                <ul class="space-y-2 text-sm">
                  <li>• The manga is unopened (original seal)</li>
                  <li>• Less than 7 days have passed since purchase</li>
                  <li>• You have the purchase receipt</li>
                  <li>• The product arrived defective or damaged</li>
                </ul>
              </div>
              <div class="bg-red-50 dark:bg-red-900/30 rounded-xl p-6">
                <h3 class="font-bold text-red-700 dark:text-red-400 mb-3">✗ We don't accept returns if:</h3>
                <ul class="space-y-2 text-sm">
                  <li>• The manga has been opened or read</li>
                  <li>• More than 7 days have passed</li>
                  <li>• The damage was caused by the customer</li>
                  <li>• It's a final sale item</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 3 -->
        <section class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl">💵</span>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Refunds</h2>
          </div>
          <div class="text-gray-600 dark:text-gray-400 space-y-4">
            <div class="overflow-x-auto">
              <table class="w-full mt-4">
                <thead>
                  <tr class="border-b dark:border-gray-700">
                    <th class="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Type</th>
                    <th class="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Processing Time</th>
                    <th class="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Method</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b dark:border-gray-700">
                    <td class="py-3 px-4">Rental deposit</td>
                    <td class="py-3 px-4">24-48 hours</td>
                    <td class="py-3 px-4">Same payment method</td>
                  </tr>
                  <tr class="border-b dark:border-gray-700">
                    <td class="py-3 px-4">Purchase (defective product)</td>
                    <td class="py-3 px-4">3-5 business days</td>
                    <td class="py-3 px-4">Same payment method</td>
                  </tr>
                  <tr class="border-b dark:border-gray-700">
                    <td class="py-3 px-4">Purchase (change of mind)</td>
                    <td class="py-3 px-4">5-7 business days</td>
                    <td class="py-3 px-4">Store credit</td>
                  </tr>
                  <tr>
                    <td class="py-3 px-4">Order cancellation</td>
                    <td class="py-3 px-4">Immediate (if not shipped)</td>
                    <td class="py-3 px-4">Same payment method</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Section 4 -->
        <section class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl">🔄</span>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Exchanges</h2>
          </div>
          <div class="text-gray-600 dark:text-gray-400 space-y-4">
            <p>We offer exchanges in the following cases:</p>
            <ul class="space-y-3 mt-4">
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-1">✓</span>
                <span><strong>Defective product:</strong> Immediate exchange for the same product at no additional cost.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-1">✓</span>
                <span><strong>Wrong volume:</strong> Exchange for the correct volume if available.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-1">✓</span>
                <span><strong>Different title:</strong> Possible within 48 hours if the product has not been opened.</span>
              </li>
            </ul>
            <div class="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mt-6">
              <p class="text-indigo-800 dark:text-indigo-200 text-sm">
                <strong>Tip:</strong> For faster exchanges, contact us via WhatsApp at +1 (555) 123-4567 with your order number.
              </p>
            </div>
          </div>
        </section>

        <!-- Section 5 -->
        <section class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl">⚠️</span>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Damages & Fees</h2>
          </div>
          <div class="text-gray-600 dark:text-gray-400 space-y-4">
            <p>In case of damage to rented manga, the following charges will apply:</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div class="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-6 text-center">
                <div class="text-2xl mb-2">📄</div>
                <div class="font-bold text-yellow-700 dark:text-yellow-400">Minor damage</div>
                <div class="text-sm mt-2">Folded pages, light wear</div>
                <div class="text-lg font-bold text-yellow-600 mt-2">$5-10</div>
              </div>
              <div class="bg-orange-50 dark:bg-orange-900/30 rounded-xl p-6 text-center">
                <div class="text-2xl mb-2">💧</div>
                <div class="font-bold text-orange-700 dark:text-orange-400">Moderate damage</div>
                <div class="text-sm mt-2">Stains, minor tears</div>
                <div class="text-lg font-bold text-orange-600 mt-2">25-50%</div>
                <div class="text-xs text-gray-500">of manga value</div>
              </div>
              <div class="bg-red-50 dark:bg-red-900/30 rounded-xl p-6 text-center">
                <div class="text-2xl mb-2">🚫</div>
                <div class="font-bold text-red-700 dark:text-red-400">Severe damage</div>
                <div class="text-sm mt-2">Missing pages, irreparable damage</div>
                <div class="text-lg font-bold text-red-600 mt-2">100%</div>
                <div class="text-xs text-gray-500">of manga value</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Contact CTA -->
      <div class="mt-16 max-w-4xl mx-auto text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <h2 class="text-2xl font-bold mb-4">Need to make a return?</h2>
        <p class="mb-6 opacity-90">Contact us and we'll help you with the process.</p>
        <div class="flex justify-center gap-4">
          <a href="mailto:returns@mangago.com" class="inline-block bg-white text-indigo-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
            Request Return
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
