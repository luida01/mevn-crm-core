<template>
  <div class="storefront min-h-screen">
    <ShopHeader />
    <main class="confirmation-page">
      <section class="confirmation-card" aria-live="polite">
        <span class="confirmation-icon" :class="`confirmation-icon--${status}`">{{ status === 'paid' ? '✓' : status === 'failed' ? '!' : '…' }}</span>
        <p class="section-eyebrow">{{ t('checkout.order') }}</p>
        <h1>{{ heading }}</h1>
        <p class="confirmation-message">{{ message }}</p>
        <template v-if="receipt">
          <div class="confirmation-receipt"><div><span>{{ t('checkout.receipt') }}</span><strong>{{ receipt.number }}</strong></div><div><span>{{ t('checkout.customer') }}</span><strong>{{ receipt.customer.name }}</strong></div><ul><li v-for="(item,index) in receipt.items" :key="index"><span>{{ item.title }} · Vol. {{ item.volume }} · {{ item.kind === 'rental' ? `${t('checkout.rental')}, ${item.days} ${t('checkout.days')}` : t('checkout.purchase') }} × {{ item.quantity }}</span><b>${{ item.lineTotal.toFixed(2) }}</b></li></ul><div class="confirmation-total"><span>{{ t('checkout.total') }}</span><strong>${{ receipt.total.toFixed(2) }} {{ receipt.currency.toUpperCase() }}</strong></div><small>{{ t('checkout.nonFiscal') }}</small></div>
          <div class="confirmation-actions"><router-link to="/catalogo">{{ t('checkout.backCatalog') }}</router-link><button type="button" @click="windowPrint">{{ t('checkout.print') }}</button></div>
        </template>
        <div v-else-if="status === 'failed'" class="confirmation-actions"><router-link to="/carrito">{{ t('checkout.backCart') }}</router-link><router-link to="/catalogo">{{ t('checkout.explore') }}</router-link></div>
      </section>
    </main>
    <ShopFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';
import ShopFooter from '../components/ShopFooter.vue';
import ShopHeader from '../components/ShopHeader.vue';
import { useCartStore } from '../stores/cartStore';
import { t } from '../i18n';

type Receipt = { number: string; customer: { name: string }; items: Array<{ title: string; volume: number; kind: 'rental' | 'purchase'; days?: number | null; quantity: number; lineTotal: number }>; total: number; currency: string };
type Confirmation = { status: 'pending' | 'paid' | 'expired' | 'cancelled' | 'failed'; receipt?: Receipt };
const route = useRoute();
const cart = useCartStore();
const status = ref<Confirmation['status']>('pending');
const receipt = ref<Receipt>();
const heading = ref(t('checkout.confirming'));
const message = ref(t('checkout.waiting'));
const windowPrint = () => window.print();
const loadConfirmation = async () => {
  const sessionId = route.query.session_id;
  const token = route.query.token;
  if (typeof sessionId !== 'string' || typeof token !== 'string') { status.value = 'failed'; heading.value = t('checkout.notFound'); message.value = t('checkout.returnCart'); return; }
  for (let attempt = 0; attempt < 12; attempt += 1) {
    try {
      const result = (await api.get<Confirmation>(`/checkout/confirmation/${encodeURIComponent(sessionId)}`, { params: { token } })).data;
      status.value = result.status;
      if (result.status === 'paid' && result.receipt) {
        receipt.value = result.receipt;
        heading.value = t('checkout.confirmed');
        message.value = t('checkout.approved');
        cart.clear();
        return;
      }
      if (result.status === 'expired' || result.status === 'failed' || result.status === 'cancelled') {
        heading.value = t('checkout.incomplete'); message.value = t('checkout.released'); return;
      }
    } catch {
      if (attempt === 11) { status.value = 'failed'; heading.value = t('checkout.verifyFailed'); message.value = t('checkout.checkLater'); return; }
    }
    await new Promise(resolve => window.setTimeout(resolve, 1800));
  }
  message.value = t('checkout.pending');
};
onMounted(loadConfirmation);
</script>

<style scoped>
.confirmation-page{display:grid;min-height:65vh;place-items:start center;padding:60px 18px 90px}.confirmation-card{width:min(680px,100%);border:1px solid var(--shop-line);border-radius:24px;background:var(--shop-surface);padding:clamp(24px,5vw,46px);box-shadow:0 18px 55px #342c2010}.confirmation-icon{display:grid;width:62px;height:62px;place-items:center;margin-bottom:21px;border-radius:50%;background:#f2e4c5;color:#715017;font-size:1.6rem;font-weight:850}.confirmation-icon--paid{background:#e2ecdf;color:var(--shop-green)}.confirmation-icon--failed{background:#f7e4df;color:var(--shop-accent-dark)}.confirmation-card h1{margin:0;color:var(--shop-ink);font:800 clamp(2rem,6vw,3rem)/1.1 Georgia,'Times New Roman',serif}.confirmation-message{color:var(--shop-muted);font-size:.9rem;line-height:1.65}.confirmation-receipt{margin-top:25px;border:1px solid var(--shop-line);border-radius:15px;padding:19px}.confirmation-receipt>div{display:flex;justify-content:space-between;gap:14px;padding:8px 0;font-size:.8rem}.confirmation-receipt>div span{color:var(--shop-muted)}.confirmation-receipt ul{margin:12px 0;padding:7px 0;border-block:1px solid var(--shop-line);list-style:none}.confirmation-receipt li{display:flex;justify-content:space-between;gap:15px;padding:9px 0;font-size:.76rem}.confirmation-receipt li b{white-space:nowrap}.confirmation-receipt .confirmation-total{font-size:.95rem;font-weight:850}.confirmation-receipt .confirmation-total strong{color:var(--shop-accent);font-size:1.13rem}.confirmation-receipt>small{display:block;margin-top:10px;color:var(--shop-muted);font-size:.67rem}.confirmation-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}.confirmation-actions a,.confirmation-actions button{display:inline-flex;min-height:43px;align-items:center;justify-content:center;border:0;border-radius:999px;background:var(--shop-ink);padding:0 17px;color:#fff;font-size:.76rem;font-weight:800;text-decoration:none;cursor:pointer}.confirmation-actions a:first-child{background:var(--shop-green)}@media print{.storefront>header,.storefront>footer,.confirmation-actions{display:none!important}.confirmation-page{padding:0}.confirmation-card{border:0;box-shadow:none}.confirmation-icon{display:none}}
</style>
