<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import InfoPageLayout from '../components/InfoPageLayout.vue';
import api from '../services/api';
import axios from 'axios';
import { t } from '../i18n';

const route = useRoute();
const params = new URLSearchParams(route.hash.slice(1));
const action = params.get('action');
const token = params.get('token');
const valid = Boolean(token && ['confirm', 'unsubscribe'].includes(action || ''));
const busy = ref(false);
const done = ref(false);
const errorKey = ref(valid ? '' : 'alerts.invalidLink');
const title = computed(() => t(action === 'unsubscribe' ? 'alerts.cancelTitle' : 'alerts.activateTitle'));
const submit = async () => {
  if (!valid || busy.value || done.value) return;
  busy.value = true;
  errorKey.value = '';
  try {
    await api.post(`/stock-alerts/${action}`, { token });
    done.value = true;
    // Do not retain the bearer token in the address bar after it has been used.
    window.history.replaceState(window.history.state, '', route.path);
  } catch (error: unknown) {
    errorKey.value = axios.isAxiosError(error) && error.response?.status === 400 ? 'alerts.invalidLink' : 'alerts.failed';
  } finally { busy.value = false; }
};
</script>

<template>
  <InfoPageLayout :eyebrow="t('alerts.title')" :title="title" :description="t('alerts.manageDescription')">
    <section class="alert-management">
      <p v-if="done" role="status">{{ t(action === 'unsubscribe' ? 'alerts.cancelled' : 'alerts.activated') }}</p>
      <template v-else>
        <p v-if="errorKey" role="alert">{{ t(errorKey) }}</p>
        <button v-if="valid" type="button" :disabled="busy" @click="submit">{{ busy ? t('alerts.sending') : title }}</button>
      </template>
      <RouterLink to="/catalogo">{{ t('cart.explore') }} →</RouterLink>
    </section>
  </InfoPageLayout>
</template>

<style scoped>
.alert-management { display: grid; justify-items: start; gap: 20px; padding: 24px; color: var(--shop-ink); background: var(--shop-surface); border: 1px solid var(--shop-line); border-radius: 18px; line-height: 1.7; }
.alert-management button { padding: 12px 24px; border: 0; border-radius: 12px; background: var(--shop-green); color: white; font: inherit; cursor: pointer; }
.alert-management button:disabled { opacity: .5; cursor: wait; }
.alert-management a { color: var(--shop-green); font-weight: 700; }
</style>
