<template>
  <div class="storefront min-h-screen">
    <ShopHeader />
    <main class="cart-page">
      <div class="cart-page__heading"><div><p class="section-eyebrow">Tu selección</p><h1>Tu carrito</h1><p>Combina volúmenes para comprar y alquilar en una sola revisión.</p></div><router-link to="/catalogo">← Seguir explorando</router-link></div>

      <div v-if="cart.lines.length" class="cart-layout">
        <section class="cart-lines" aria-label="Artículos en tu carrito">
          <article v-for="line in cart.lines" :key="lineKey(line)" class="cart-line">
            <img :src="line.manga.coverImage || '/no-cover.svg'" :alt="`Portada de ${line.manga.title}`" @error="coverError">
            <div class="cart-line__details">
              <p class="cart-line__type" :class="`cart-line__type--${line.kind}`">{{ line.kind === 'rental' ? 'Alquiler' : 'Compra' }}</p>
              <h2>{{ line.manga.title }}</h2><p class="cart-line__meta">Vol. {{ line.manga.volume }} · {{ line.manga.author }}</p>
              <p class="cart-line__availability" :class="{ 'cart-line__availability--low': !lineHasAvailability(line) }">{{ lineHasAvailability(line) ? `${line.manga.stock} en stock` : line.manga.stock < 1 ? 'Sin stock disponible' : `Stock insuficiente para el carrito` }} · El carrito no reserva unidades</p>
              <div class="cart-line__controls">
                <label><span>Cantidad</span><input type="number" min="1" :max="maxQuantity(line)" :value="line.quantity" :disabled="line.manga.stock < 1" @change="changeQuantity(line,$event)"></label>
                <label v-if="line.kind === 'rental'"><span>Días de alquiler</span><input type="number" min="1" max="30" :value="line.days" @change="changeDays(line,$event)"></label>
              </div>
            </div>
            <div class="cart-line__price"><strong>${{ lineTotal(line).toFixed(2) }}</strong><small>{{ line.kind === 'rental' ? `$${line.manga.rentalPrice.toFixed(2)} × ${line.days} día(s)` : `$${line.manga.price.toFixed(2)} c/u` }}</small><button type="button" @click="cart.remove(lineKey(line))">Quitar</button></div>
          </article>
        </section>

        <aside class="cart-summary" aria-label="Resumen del carrito">
          <p class="section-eyebrow">Resumen</p><h2>Tu pedido</h2>
          <div><span>Artículos</span><strong>{{ cart.itemCount }}</strong></div>
          <div class="cart-summary__total"><span>Total estimado</span><strong>${{ cart.subtotal.toFixed(2) }}</strong></div>
          <p>Los alquileres se calculan por volumen, unidad y día.</p>
          <p v-if="hasUnavailableStock" class="cart-summary__error" role="alert">Revisa las cantidades: algún volumen ya no tiene stock suficiente.</p>
          <button type="button" :disabled="hasUnavailableStock" @click="checkoutOpen = true">Continuar al pago</button>
          <small>Pasarela de demostración · no se aceptan pagos reales</small>
        </aside>
      </div>

      <section v-else class="cart-empty"><span aria-hidden="true">▤</span><h2>Tu carrito está vacío</h2><p>Agrega un volumen para comprarlo o alquilarlo y aparecerá aquí.</p><router-link to="/catalogo">Explorar catálogo</router-link></section>
    </main>
    <CartCheckoutDialog v-if="checkoutOpen" :lines="cart.lines" @close="checkoutOpen = false" />
    <ShopFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import CartCheckoutDialog from '../components/CartCheckoutDialog.vue';
import ShopFooter from '../components/ShopFooter.vue';
import ShopHeader from '../components/ShopHeader.vue';
import { useCartStore, type CartLine } from '../stores/cartStore';

const cart = useCartStore();
const checkoutOpen = ref(false);
const lineKey = (line: CartLine) => `${line.manga._id}:${line.kind}`;
const lineTotal = (line: CartLine) => (line.kind === 'purchase' ? line.manga.price : line.manga.rentalPrice * line.days) * line.quantity;
const totalForManga = (mangaId: string) => cart.lines.filter(line => line.manga._id === mangaId).reduce((sum, line) => sum + line.quantity, 0);
const lineHasAvailability = (line: CartLine) => line.manga._id ? totalForManga(line.manga._id) <= line.manga.stock : false;
const maxQuantity = (line: CartLine) => Math.max(1, line.manga.stock - (line.manga._id ? totalForManga(line.manga._id) - line.quantity : 0));
const hasUnavailableStock = computed(() => cart.lines.some(line => line.manga._id ? totalForManga(line.manga._id) > line.manga.stock : true));
const changeQuantity = (line: CartLine, event: Event) => {
  const input = event.currentTarget as HTMLInputElement;
  cart.setQuantity(lineKey(line), Number(input.value));
  input.value = String(line.quantity);
};
const changeDays = (line: CartLine, event: Event) => {
  const input = event.currentTarget as HTMLInputElement;
  cart.setDays(lineKey(line), Number(input.value));
  input.value = String(line.days);
};
const coverError = (event: Event) => {
  const image = event.currentTarget as HTMLImageElement;
  image.onerror = null;
  image.src = '/no-cover.svg';
};
</script>

<style scoped>
.cart-page { max-width:1200px; min-height:60vh; margin-inline:auto; padding:48px 30px 90px; }
.cart-page__heading { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-bottom:28px; }
.cart-page__heading h1 { margin:0; color:var(--shop-ink); font:800 clamp(2.5rem,5vw,4rem)/1.05 Georgia,'Times New Roman',serif; letter-spacing:-.04em; }
.cart-page__heading p:last-child { margin:11px 0 0; color:var(--shop-muted); line-height:1.6; }
.cart-page__heading>a { flex:0 0 auto; color:var(--shop-green); font-size:.85rem; font-weight:800; text-decoration:none; }
.cart-layout { display:grid; grid-template-columns:minmax(0,1fr) 310px; align-items:start; gap:22px; }
.cart-lines { display:grid; gap:13px; }
.cart-line { display:grid; grid-template-columns:92px minmax(0,1fr) auto; align-items:center; gap:17px; border:1px solid var(--shop-line); border-radius:18px; background:var(--shop-surface); padding:15px; }
.cart-line>img { width:92px; height:126px; border-radius:11px; background:var(--shop-paper-deep); object-fit:cover; }
.cart-line__details { min-width:0; }
.cart-line__type { display:inline-flex; margin:0 0 7px; border-radius:999px; background:#e2ecdf; padding:5px 9px; color:var(--shop-green); font-size:.66rem; font-weight:850; text-transform:uppercase; }
.cart-line__type--purchase { background:#f5e4d8; color:var(--shop-accent-dark); }
.cart-line__details h2 { overflow:hidden; margin:0; color:var(--shop-ink); font:800 1.12rem/1.2 Georgia,'Times New Roman',serif; text-overflow:ellipsis; }
.cart-line__meta { margin:5px 0; color:var(--shop-muted); font-size:.78rem; }
.cart-line__availability { margin:0; color:var(--shop-green); font-size:.68rem; }
.cart-line__availability--low { color:#a53c27; font-weight:800; }
.cart-line__controls { display:flex; flex-wrap:wrap; gap:9px; margin-top:11px; }
.cart-line__controls label { display:grid; gap:4px; color:var(--shop-muted); font-size:.65rem; font-weight:700; }
.cart-line__controls input { width:92px; min-height:34px; border:1px solid var(--shop-line); border-radius:8px; background:#fff; padding:5px 8px; color:var(--shop-ink); font:inherit; font-size:.76rem; }
.cart-line__price { display:grid; justify-items:end; gap:4px; white-space:nowrap; }
.cart-line__price strong { color:var(--shop-ink); font-size:1.04rem; }
.cart-line__price small { color:var(--shop-muted); font-size:.65rem; }
.cart-line__price button { margin-top:9px; border:0; background:transparent; color:var(--shop-accent-dark); cursor:pointer; font:inherit; font-size:.72rem; font-weight:800; }
.cart-summary { position:sticky; top:105px; border:1px solid var(--shop-line); border-radius:18px; background:var(--shop-surface); padding:21px; box-shadow:0 10px 28px rgba(49,39,27,.05); }
.cart-summary .section-eyebrow { margin-bottom:7px; }
.cart-summary h2 { margin:0 0 19px; color:var(--shop-ink); font:800 1.5rem Georgia,'Times New Roman',serif; }
.cart-summary>div { display:flex; justify-content:space-between; gap:12px; padding:10px 0; color:var(--shop-muted); font-size:.82rem; }
.cart-summary>div strong { color:var(--shop-ink); }
.cart-summary .cart-summary__total { border-top:1px solid var(--shop-line); margin-top:4px; padding-top:16px; color:var(--shop-ink); font-weight:800; }
.cart-summary__total strong { color:var(--shop-accent)!important; font-size:1.25rem; }
.cart-summary>p:not(.section-eyebrow) { color:var(--shop-muted); font-size:.72rem; line-height:1.55; }
.cart-summary .cart-summary__error { color:var(--shop-accent-dark)!important; font-weight:800; }
.cart-summary>button { width:100%; min-height:47px; margin-top:8px; border:0; border-radius:999px; background:var(--shop-ink); color:white; cursor:pointer; font:inherit; font-size:.82rem; font-weight:800; }
.cart-summary>button:hover:not(:disabled) { background:var(--shop-green); }
.cart-summary>button:disabled { opacity:.48; cursor:not-allowed; }
.cart-summary>small { display:block; margin-top:10px; color:var(--shop-muted); font-size:.66rem; line-height:1.45; text-align:center; }
.cart-empty { display:grid; justify-items:center; padding:80px 20px; border:1px dashed var(--shop-line); border-radius:22px; background:rgba(255,253,248,.6); text-align:center; }
.cart-empty>span { display:grid; width:58px; height:58px; place-items:center; border-radius:18px; background:#e2ecdf; color:var(--shop-green); font-size:1.7rem; }
.cart-empty h2 { margin:17px 0 6px; color:var(--shop-ink); font:800 1.7rem Georgia,'Times New Roman',serif; }
.cart-empty p { margin:0; color:var(--shop-muted); font-size:.87rem; line-height:1.6; }
.cart-empty>a { display:inline-flex; min-height:44px; align-items:center; margin-top:19px; border-radius:999px; background:var(--shop-green); padding:0 19px; color:#fff; font-size:.8rem; font-weight:800; text-decoration:none; }
@media(max-width:850px) { .cart-layout { grid-template-columns:1fr; } .cart-summary { position:static; } }
@media(max-width:600px) { .cart-page { padding:34px 16px 65px; } .cart-page__heading { align-items:flex-start; flex-direction:column; gap:14px; } .cart-line { grid-template-columns:70px minmax(0,1fr); gap:12px; padding:12px; } .cart-line>img { width:70px; height:96px; } .cart-line__price { grid-column:2; display:flex; width:100%; align-items:center; justify-content:space-between; white-space:normal; } .cart-line__price button { margin:0 0 0 auto; } }
</style>
