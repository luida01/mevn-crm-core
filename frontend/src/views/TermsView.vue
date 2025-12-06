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
          <li class="text-gray-900 dark:text-white font-medium">Terms & Conditions</li>
        </ol>
      </nav>

      <!-- Page Title -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">📜 Terms & Conditions</h1>
        <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Last updated: December 2024
        </p>
      </div>

      <!-- Table of Contents -->
      <div class="max-w-4xl mx-auto mb-12">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 class="font-bold text-gray-900 dark:text-white mb-4">Table of Contents</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <a href="#general" class="text-indigo-600 hover:underline">1. General Information</a>
            <a href="#usage" class="text-indigo-600 hover:underline">2. Service Usage</a>
            <a href="#account" class="text-indigo-600 hover:underline">3. User Account</a>
            <a href="#rental" class="text-indigo-600 hover:underline">4. Rental Service</a>
            <a href="#purchases" class="text-indigo-600 hover:underline">5. Purchases</a>
            <a href="#payments" class="text-indigo-600 hover:underline">6. Payments & Billing</a>
            <a href="#intellectual" class="text-indigo-600 hover:underline">7. Intellectual Property</a>
            <a href="#privacy" class="text-indigo-600 hover:underline">8. Privacy</a>
            <a href="#liability" class="text-indigo-600 hover:underline">9. Limitation of Liability</a>
            <a href="#modifications" class="text-indigo-600 hover:underline">10. Modifications</a>
          </div>
        </div>
      </div>

      <!-- Content Sections -->
      <div class="max-w-4xl mx-auto space-y-8">
        <!-- Section 1 -->
        <section id="general" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. General Information</h2>
          <div class="text-gray-600 dark:text-gray-400 space-y-4 text-sm leading-relaxed">
            <p>
              Welcome to <strong>MangaGo</strong> ("we", "our", or "the Company"). These Terms and Conditions 
              ("Terms") govern your use of our website located at mangago.com and all related services 
              (collectively, the "Service").
            </p>
            <p>
              By accessing or using the Service, you agree to be bound by these Terms. If you do not agree 
              with any part of the terms, you may not access the Service.
            </p>
            <p>
              The Service is intended for users who are at least 13 years old. If you are under 18, you must 
              have parental or legal guardian consent to use the Service.
            </p>
          </div>
        </section>

        <!-- Section 2 -->
        <section id="usage" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Service Usage</h2>
          <div class="text-gray-600 dark:text-gray-400 space-y-4 text-sm leading-relaxed">
            <p>By using our Service, you agree to:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information during registration.</li>
              <li>Maintain the security of your password and account.</li>
              <li>Not use the Service for illegal or unauthorized purposes.</li>
              <li>Not attempt to access restricted areas of the system.</li>
              <li>Not reproduce, duplicate, or resell any part of the Service.</li>
              <li>Treat rented or purchased materials with respect.</li>
            </ul>
            <p class="mt-4">
              We reserve the right to suspend or terminate your account if you violate these terms or if we 
              detect suspicious or fraudulent activity.
            </p>
          </div>
        </section>

        <!-- Section 3 -->
        <section id="account" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. User Account</h2>
          <div class="text-gray-600 dark:text-gray-400 space-y-4 text-sm leading-relaxed">
            <p>
              To access certain features of the Service, you must create an account. By creating an account, you agree to:
            </p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Provide a valid email address.</li>
              <li>Create a secure password and keep it confidential.</li>
              <li>Notify us immediately if you suspect unauthorized access to your account.</li>
              <li>Be responsible for all activities that occur under your account.</li>
            </ul>
            <p class="mt-4">
              You can delete your account at any time from your profile settings. When you delete your account, 
              all your personal data will be deleted in accordance with our Privacy Policy.
            </p>
          </div>
        </section>

        <!-- Section 4 -->
        <section id="rental" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Rental Service</h2>
          <div class="text-gray-600 dark:text-gray-400 space-y-4 text-sm leading-relaxed">
            <p>Our manga rental service is subject to the following conditions:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Available rental periods are 3, 7, or 14 days.</li>
              <li>A refundable deposit is required at the time of rental.</li>
              <li>Manga must be returned in the same condition as delivered.</li>
              <li>Late returns will incur additional charges of $2.00 per day.</li>
              <li>Damage to rented material will be assessed and charged accordingly.</li>
              <li>We reserve the right to refuse rentals to users with a history of non-compliance.</li>
            </ul>
            <p class="mt-4">
              For more details, please see our <router-link to="/rental-policies" class="text-indigo-600 hover:underline">Rental Policy</router-link>.
            </p>
          </div>
        </section>

        <!-- Section 5 -->
        <section id="purchases" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Purchases</h2>
          <div class="text-gray-600 dark:text-gray-400 space-y-4 text-sm leading-relaxed">
            <p>
              When making a purchase through our Service, you agree to provide current, complete, and accurate 
              payment information. You agree to pay all charges at the prices in effect at the time of your purchase.
            </p>
            <p>
              We reserve the right to refuse or cancel your order at any time for reasons including, but not 
              limited to: product availability, errors in product description or price, or errors in your order.
            </p>
            <p>
              For purchase returns and refunds, please see our 
              <router-link to="/return-policy" class="text-indigo-600 hover:underline">Return Policy</router-link>.
            </p>
          </div>
        </section>

        <!-- Section 6 -->
        <section id="payments" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Payments & Billing</h2>
          <div class="text-gray-600 dark:text-gray-400 space-y-4 text-sm leading-relaxed">
            <p>We accept the following payment methods:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Credit and debit cards (Visa, Mastercard, American Express)</li>
              <li>Bank transfers</li>
              <li>Cash on delivery (in selected areas)</li>
            </ul>
            <p class="mt-4">
              All payments are processed securely through certified payment providers. 
              We do not store complete credit card information on our servers.
            </p>
            <p>
              Electronic invoices will be sent to the email address registered in your account.
            </p>
          </div>
        </section>

        <!-- Section 7 -->
        <section id="intellectual" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Intellectual Property</h2>
          <div class="text-gray-600 dark:text-gray-400 space-y-4 text-sm leading-relaxed">
            <p>
              The Service and its original content, features, and functionality are and will remain the 
              exclusive property of MangaGo and its licensors. The Service is protected by copyright, 
              trademark, and other laws.
            </p>
            <p>
              Manga sold or rented through our service are the property of their respective authors and 
              publishers. MangaGo acts as an authorized distributor.
            </p>
            <p>
              Reproduction, distribution, or modification of any content from the Service without prior 
              written authorization is prohibited.
            </p>
          </div>
        </section>

        <!-- Section 8 -->
        <section id="privacy" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Privacy</h2>
          <div class="text-gray-600 dark:text-gray-400 space-y-4 text-sm leading-relaxed">
            <p>
              Your privacy is important to us. We collect and process personal data in accordance with 
              applicable data protection laws.
            </p>
            <p>
              The data we collect includes: contact information, order history, reading preferences, 
              and browsing data. This information is used to:
            </p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Process your orders and rentals</li>
              <li>Improve our services</li>
              <li>Send communications about orders and promotions (with your consent)</li>
              <li>Prevent fraud</li>
            </ul>
            <p class="mt-4">
              We do not sell or share your personal information with third parties, except as necessary 
              to provide our services.
            </p>
          </div>
        </section>

        <!-- Section 9 -->
        <section id="liability" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Limitation of Liability</h2>
          <div class="text-gray-600 dark:text-gray-400 space-y-4 text-sm leading-relaxed">
            <p>
              To the maximum extent permitted by law, MangaGo shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, or any loss of profits or revenues, 
              whether incurred directly or indirectly.
            </p>
            <p>
              Our total liability to you for any claim arising out of or related to these Terms or the 
              Service shall not exceed the amount you have paid us in the last 12 months.
            </p>
          </div>
        </section>

        <!-- Section 10 -->
        <section id="modifications" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Modifications</h2>
          <div class="text-gray-600 dark:text-gray-400 space-y-4 text-sm leading-relaxed">
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, 
              we will provide at least 30 days' notice before the new terms take effect.
            </p>
            <p>
              What constitutes a material change will be determined at our sole discretion. By continuing 
              to access or use our Service after those revisions become effective, you agree to be bound 
              by the revised terms.
            </p>
          </div>
        </section>

        <!-- Contact Section -->
        <section class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact</h2>
          <div class="text-gray-600 dark:text-gray-400 space-y-4 text-sm leading-relaxed">
            <p>
              If you have any questions about these Terms, you can contact us:
            </p>
            <ul class="list-disc pl-6 space-y-2">
              <li>By email: legal@mangago.com</li>
              <li>By phone: +1 (555) 123-4567</li>
              <li>By mail: 123 Manga Street, Tokyo</li>
            </ul>
          </div>
        </section>
      </div>

      <!-- Accept Terms CTA -->
      <div class="mt-16 max-w-4xl mx-auto text-center">
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          By using our services, you confirm that you have read and accepted these terms and conditions.
        </p>
        <router-link to="/" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-lg transition-colors">
          Back to Shop
        </router-link>
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
