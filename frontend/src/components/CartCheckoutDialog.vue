<template>
  <Teleport to="body">
    <dialog ref="dialogElement" class="cart-checkout" aria-labelledby="cart-checkout-title" @cancel.prevent="close" @close="emit('close')" @click="closeOnBackdrop">
      <section class="cart-checkout__panel">
        <button class="cart-checkout__close" type="button" :aria-label="t('checkoutDialog.close')" autofocus @click="close">×</button>
        <p class="cart-checkout__badge">{{ t('checkoutDialog.badge') }}</p>
        <h2 id="cart-checkout-title">{{ t('checkoutDialog.title') }}</h2>
        <p class="cart-checkout__intro">{{ t('checkoutDialog.intro') }}</p>
        <ul class="cart-checkout__items">
          <li v-for="line in lines" :key="`${line.manga._id}:${line.kind}`">
            <span><strong>{{ line.manga.title }} · Vol. {{ line.manga.volume }}</strong><small>{{ line.kind === 'rental' ? `${t('checkoutDialog.rent')} · ${line.days} ${t(line.days === 1 ? 'checkoutDialog.day' : 'checkoutDialog.days')} · ${line.quantity} ${t('checkoutDialog.unit')}` : `${t('checkoutDialog.buy')} · ${line.quantity} ${t('checkoutDialog.unit')}` }}</small></span>
            <b>${{ lineTotal(line).toFixed(2) }}</b>
          </li>
        </ul>
        <div class="cart-checkout__total"><span>{{ t('checkoutDialog.total') }}</span><strong>${{ total.toFixed(2) }}</strong></div>
        <form class="cart-checkout__form" @submit.prevent="startPayment">
          <label>{{ t('checkoutDialog.name') }}<input v-model="name" required minlength="2" maxlength="160" autocomplete="name" :placeholder="t('checkoutDialog.nameHint')"></label>
          <label>{{ t('checkoutDialog.email') }}<input v-model="email" required type="email" maxlength="254" autocomplete="email" :placeholder="t('checkoutDialog.emailHint')"></label>
          <p v-if="error" class="cart-checkout__error" role="alert">{{ error }}</p>
          <p v-if="!loadingConfig && !configured" class="cart-checkout__notice">{{ t('checkoutDialog.missingKeys') }}</p>
          <p class="cart-checkout__secure">{{ t('checkoutDialog.secure') }}</p>
          <button class="cart-checkout__submit" type="submit" :disabled="busy || loadingConfig || !configured">{{ busy ? t('checkoutDialog.connecting') : `${t('checkoutDialog.continue')} · $${total.toFixed(2)}` }}</button>
        </form>
      </section>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import api from '../services/api';
import type { CartLine } from '../stores/cartStore';
import { t } from '../i18n';

const props = defineProps<{ lines: CartLine[] }>();
const emit = defineEmits<{ close: [] }>();
const dialogElement = ref<HTMLDialogElement | null>(null);
const name = ref('');
const email = ref('');
const error = ref('');
const busy = ref(false);
const configured = ref(false);
const loadingConfig = ref(true);
const idempotencyKey = ref(crypto.randomUUID());
const lineTotal = (line: CartLine) => (line.kind === 'purchase' ? line.manga.price : line.manga.rentalPrice * line.days) * line.quantity;
const total = computed(() => props.lines.reduce((sum, line) => sum + lineTotal(line), 0));
const close = () => { if (dialogElement.value?.open) dialogElement.value.close(); else emit('close'); };
const closeOnBackdrop = (event: MouseEvent) => { if (event.target === dialogElement.value) close(); };
const startPayment = async () => {
  busy.value = true;
  error.value = '';
  try {
    const response = await api.post<{ url: string }>('/checkout/session', {
      customer: { name: name.value.trim(), email: email.value.trim() },
      items: props.lines.map(line => ({ mangaId: line.manga._id, kind: line.kind, quantity: line.quantity, days: line.kind === 'rental' ? line.days : undefined }))
    }, { headers: { 'Idempotency-Key': idempotencyKey.value } });
    if (!response.data.url) throw new Error(t('checkoutDialog.noUrl'));
    window.location.assign(response.data.url);
  } catch (requestError: unknown) {
    const message = typeof requestError === 'object' && requestError !== null && 'response' in requestError
      ? ((requestError as { response?: { data?: { message?: string } } }).response?.data?.message || t('checkoutDialog.failed'))
      : requestError instanceof Error ? requestError.message : t('checkoutDialog.failed');
    error.value = message;
    if (typeof requestError === 'object' && requestError !== null && 'response' in requestError) idempotencyKey.value = crypto.randomUUID();
    busy.value = false;
  }
};
onMounted(async () => {
  dialogElement.value?.showModal();
  try { configured.value = (await api.get<{ configured: boolean }>('/checkout/config')).data.configured; }
  catch { configured.value = false; }
  finally { loadingConfig.value = false; }
});
</script>

<style scoped>
.cart-checkout{width:min(560px,calc(100vw - 28px));max-width:none;max-height:calc(100dvh - 28px);overflow:auto;border:1px solid var(--shop-line);border-radius:24px;background:var(--shop-surface);padding:0;color:var(--shop-ink);box-shadow:0 30px 90px #1e1e1f52}.cart-checkout::backdrop{background:#181b18b3;backdrop-filter:blur(5px)}.cart-checkout__panel{position:relative;padding:30px}.cart-checkout__close{position:absolute;top:12px;right:12px;display:grid;width:38px;height:38px;place-items:center;border:1px solid var(--shop-line);border-radius:50%;background:var(--shop-surface);color:var(--shop-ink);cursor:pointer;font-size:1.45rem}.cart-checkout__badge{display:inline-flex;margin:0 0 12px;border-radius:999px;background:#f2e4c5;padding:7px 10px;color:#715017;font-size:.7rem;font-weight:850;letter-spacing:.04em;text-transform:uppercase}.cart-checkout h2{margin:0;padding-right:25px;font:800 2rem/1.1 Georgia,'Times New Roman',serif}.cart-checkout__intro{margin:9px 0 19px;color:var(--shop-muted);font-size:.85rem;line-height:1.55}.cart-checkout__items{display:grid;gap:0;max-height:180px;overflow:auto;margin:0;border:1px solid var(--shop-line);border-radius:14px;padding:0 14px;list-style:none}.cart-checkout__items li{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid var(--shop-line)}.cart-checkout__items li:last-child{border:0}.cart-checkout__items span,.cart-checkout__items strong,.cart-checkout__items small{display:block}.cart-checkout__items strong{font-size:.8rem}.cart-checkout__items small{margin-top:4px;color:var(--shop-muted);font-size:.72rem}.cart-checkout__items li>b{flex:0 0 auto;color:var(--shop-green);font-size:.85rem}.cart-checkout__total{display:flex;justify-content:space-between;align-items:center;margin-top:9px;padding:13px 2px;font-size:.85rem;font-weight:800}.cart-checkout__total strong{color:var(--shop-accent);font-size:1.25rem}.cart-checkout__form{display:grid;gap:12px}.cart-checkout__form label{display:grid;gap:6px;color:var(--shop-muted);font-size:.75rem;font-weight:750}.cart-checkout__form input{min-height:43px;border:1px solid var(--shop-line);border-radius:10px;background:#fff;padding:8px 11px;color:var(--shop-ink);font:inherit;font-size:.85rem}.cart-checkout__secure,.cart-checkout__notice,.cart-checkout__error{margin:3px 0;border-left:3px solid var(--shop-green);padding:8px 0 8px 11px;color:var(--shop-muted);font-size:.73rem;line-height:1.55}.cart-checkout__notice,.cart-checkout__error{border-color:var(--shop-accent);color:#735a4f}.cart-checkout__error{color:#a53c27;font-weight:700}.cart-checkout__submit{width:100%;min-height:48px;border:0;border-radius:999px;background:var(--shop-ink);color:#fff;cursor:pointer;font:inherit;font-size:.85rem;font-weight:800}.cart-checkout__submit:hover:not(:disabled){background:var(--shop-green)}.cart-checkout__submit:disabled{cursor:not-allowed;opacity:.5}@media(max-width:520px){.cart-checkout__panel{padding:27px 19px 22px}.cart-checkout h2{font-size:1.7rem}}
</style>
