<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed, watch, nextTick } from 'vue';

const route = useRoute();

// Scroll to top when route changes
watch(() => route.path, () => {
  nextTick(() => {
    const scrollContainer = document.querySelector('.min-h-screen');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'instant' });
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Main Content Area -->
    <main class="flex-grow">
      <router-view></router-view>
    </main>
  </div>
</template>
