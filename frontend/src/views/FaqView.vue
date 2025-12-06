<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Scroll anchor -->
    <div ref="scrollAnchor" style="position: absolute; top: 0;"></div>
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
          <li class="text-gray-900 dark:text-white font-medium">Frequently Asked Questions</li>
        </ol>
      </nav>

      <!-- Page Title -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">❓ Frequently Asked Questions</h1>
        <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Find answers to the most common questions about our manga rental and sales services.
        </p>
      </div>

      <!-- FAQ Accordion -->
      <div class="max-w-3xl mx-auto space-y-4">
        <div 
          v-for="(faq, index) in faqs" 
          :key="index"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          <button 
            @click="toggleFaq(index)"
            class="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span class="font-semibold text-gray-900 dark:text-white">{{ faq.question }}</span>
            <svg 
              :class="{ 'rotate-180': openFaqIndex === index }"
              class="w-5 h-5 text-indigo-600 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div 
            v-show="openFaqIndex === index"
            class="px-6 pb-5 text-gray-600 dark:text-gray-400"
          >
            <p>{{ faq.answer }}</p>
          </div>
        </div>
      </div>

      <!-- Contact CTA -->
      <div class="mt-16 text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <h2 class="text-2xl font-bold mb-4">Didn't find what you were looking for?</h2>
        <p class="mb-6 opacity-90">Our support team is available to help you.</p>
        <a href="mailto:info@mangago.com" class="inline-block bg-white text-indigo-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
          Contact Us
        </a>
      </div>
    </div>

    <ShopFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ShopFooter from '../components/ShopFooter.vue';

const scrollAnchor = ref<HTMLElement | null>(null);

// Scroll to top when page loads
onMounted(() => {
  scrollAnchor.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

const openFaqIndex = ref<number | null>(null);

const toggleFaq = (index: number) => {
  openFaqIndex.value = openFaqIndex.value === index ? null : index;
};

const faqs = [
  {
    question: 'How does the manga rental service work?',
    answer: 'Our rental service allows you to enjoy your favorite manga for a set period. Select the manga you want, choose the rental period (3, 7, or 14 days), and receive it at your doorstep. At the end of the period, you can return it or extend the rental.'
  },
  {
    question: 'How long can I rent a manga?',
    answer: 'We offer flexible rental periods: 3 days, 7 days, or 14 days. The price varies depending on the selected duration. You can also extend your rental from your account before it expires.'
  },
  {
    question: 'What happens if I return the manga late?',
    answer: 'If you return the manga after the due date, an additional charge of $2.00 per day of delay will apply. We will send you email reminders before the due date to avoid additional charges.'
  },
  {
    question: 'In what condition should I return the manga?',
    answer: 'The manga must be returned in the same condition you received it. We accept normal wear from use, but significant damage such as torn pages, stains, or water damage may result in additional charges.'
  },
  {
    question: 'Can I buy a manga that I have rented?',
    answer: 'Yes! If you fall in love with a manga you have rented, you can buy it. The purchase price will be reduced by 50% of the amount you already paid for the rental.'
  },
  {
    question: 'Do you ship nationwide?',
    answer: 'Yes, we ship throughout the country. Shipping within the capital city is free for orders over $25. For other areas, the shipping cost is calculated at checkout.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept credit and debit cards (Visa, Mastercard, American Express), bank transfers, and cash on delivery in selected areas. We will soon integrate more digital payment options.'
  },
  {
    question: 'How can I view my rental history?',
    answer: 'You can view your complete rental history by logging into your account and accessing the "My Rentals" section. There you will find all your active, past rentals and any pending charges.'
  },
  {
    question: 'Do you offer discounts for frequent rentals?',
    answer: 'Yes! We have a loyalty program where you earn points for each rental. These points can be redeemed for discounts on future rentals or purchases. We also offer special promotions for frequent members.'
  },
  {
    question: 'Can I rent complete series?',
    answer: 'Absolutely. We offer special packages for complete series with discounts of up to 30%. You can select the "Rent Complete Series" option on the page of any manga that belongs to a series.'
  }
];
</script>
