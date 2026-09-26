<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import api from '../services/api';
import { getLocale, t } from '../i18n';

const props = defineProps<{ mangaId: string }>();
const email = ref('');
const consent = ref(false);
const busy = ref(false);
const done = ref(false);
const errorKey = ref('');
const submit = async () => {
  if (busy.value || done.value) return;
  busy.value = true;
  errorKey.value = '';
  try {
    await api.post('/stock-alerts', { mangaId: props.mangaId, email: email.value.trim(), locale: getLocale(), consent: consent.value });
    done.value = true;
    email.value = '';
  } catch (error: unknown) {
    const code: unknown = axios.isAxiosError(error) ? error.response?.data?.code : undefined;
    errorKey.value = code === 'IN_STOCK' ? 'alerts.inStock' : code === 'RATE_LIMITED' ? 'alerts.rateLimit'
      : code === 'EMAIL_UNAVAILABLE' ? 'alerts.unavailable' : 'alerts.failed';
  } finally { busy.value = false; }
};
</script>

<template>
  <section class="stock-alert" aria-labelledby="stock-alert-title">
    <h3 id="stock-alert-title">{{ t('alerts.title') }}</h3>
    <p>{{ t('alerts.description') }}</p>
    <p v-if="done" class="stock-alert__success" role="status">{{ t('alerts.registered') }}</p>
    <form v-else @submit.prevent="submit">
      <label class="stock-alert__email">{{ t('alerts.email') }}
        <input v-model="email" type="email" name="email" autocomplete="email" maxlength="254" required :disabled="busy" placeholder="tu@correo.com">
      </label>
      <label class="stock-alert__consent"><input v-model="consent" type="checkbox" required :disabled="busy"><span>{{ t('alerts.consent') }}</span></label>
      <button type="submit" :disabled="busy">{{ t(busy ? 'alerts.sending' : 'alerts.submit') }}</button>
      <p v-if="errorKey" class="stock-alert__error" role="alert">{{ t(errorKey) }}</p>
    </form>
  </section>
</template>

<style scoped>
.stock-alert { margin: 18px 0; padding: 18px; border: 1px solid var(--shop-line); border-radius: 16px; background: var(--shop-paper); }
.stock-alert h3 { margin: 0 0 8px; color: var(--shop-ink); font-size: 1rem; }
.stock-alert p { color: var(--shop-muted); font-size: .82rem; line-height: 1.6; }
.stock-alert__email { display: grid; gap: 6px; font-size: .82rem; font-weight: 700; }
.stock-alert input[type=email] { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid var(--shop-line); border-radius: 10px; background: var(--shop-surface); color: var(--shop-ink); font: inherit; }
.stock-alert__consent { display: flex; align-items: flex-start; gap: 8px; margin: 12px 0; color: var(--shop-muted); font-size: .75rem; line-height: 1.6; }
.stock-alert__consent input { flex-shrink: 0; margin-top: 4px; accent-color: var(--shop-green); }
.stock-alert button { min-height: 44px; border: 0; border-radius: 12px; padding: 10px 18px; background: var(--shop-green); color: white; font: inherit; font-size: .83rem; font-weight: 700; cursor: pointer; }
.stock-alert button:disabled { opacity: .6; cursor: wait; }
.stock-alert .stock-alert__success { color: var(--shop-green); font-weight: 700; }
.stock-alert .stock-alert__error { color: var(--shop-accent); }
</style>
