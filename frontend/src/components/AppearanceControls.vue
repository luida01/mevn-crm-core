<template>
  <div class="appearance-controls" :aria-label="t('nav.theme')">
    <button type="button" :aria-label="t('nav.theme')" :title="t('nav.theme')" @click="toggleTheme">{{ getTheme() === 'light' ? '☾' : '☀' }}</button>
    <button type="button" :aria-label="t('nav.language')" :title="t('nav.language')" @click="toggleLocale">{{ getLocale().toUpperCase() }}</button>
  </div>
</template>
<script setup lang="ts">
import { getLocale, getTheme, t, toggleLocale, toggleTheme } from '../i18n';
</script>
