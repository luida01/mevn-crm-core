<template>
  <Teleport to="body">
    <dialog ref="dialogElement" class="cart-checkout" aria-labelledby="cart-checkout-title" @cancel.prevent="close" @close="emit('close')" @click="closeOnBackdrop">
      <section class="cart-checkout__panel">
        <button class="cart-checkout__close" type="button" aria-label="Cerrar pago de demostración" autofocus @click="close">×</button>
        <div v-if="!completed">
          <p class="cart-checkout__badge">◉ Pasarela de prueba</p>
          <h2 id="cart-checkout-title">Revisa tu pedido</h2>
          <p class="cart-checkout__intro">Tu carrito puede incluir compras y alquileres en una sola operación.</p>
          <ul class="cart-checkout__items">
            <li v-for="line in lines" :key="`${line.manga._id}:${line.kind}`">
              <span><strong>{{ line.manga.title }} · Vol. {{ line.manga.volume }}</strong><small>{{ line.kind === 'rental' ? `Alquiler · ${line.days} ${line.days === 1 ? 'día' : 'días'} · ${line.quantity} unidad(es)` : `Compra · ${line.quantity} unidad(es)` }}</small></span>
              <b>${{ lineTotal(line).toFixed(2) }}</b>
            </li>
          </ul>
          <div class="cart-checkout__total"><span>Total de ejemplo</span><strong>${{ total.toFixed(2) }}</strong></div>
          <div class="cart-checkout__method"><span aria-hidden="true">▤</span><div><strong>Tarjeta de prueba</strong><small>No se solicitan datos de tarjeta</small></div><b>✓</b></div>
          <p class="cart-checkout__notice">No hay un proveedor de pagos conectado. Esta simulación no cobra, no crea un pedido ni reserva inventario. No ingreses datos reales.</p>
          <button class="cart-checkout__submit" type="button" @click="completed = true">Simular pago · ${{ total.toFixed(2) }}</button>
        </div>
        <div v-else class="cart-checkout__success" role="status" aria-live="polite">
          <span>✓</span><p class="cart-checkout__badge">Prueba completada</p><h2 id="cart-checkout-title">Pago simulado</h2>
          <p>No se realizó un cobro ni se registró el pedido. Tus artículos siguen en el carrito.</p>
          <button class="cart-checkout__submit" type="button" @click="close">Volver al carrito</button>
        </div>
      </section>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { CartLine } from '../stores/cartStore';

const props = defineProps<{ lines: CartLine[] }>();
const emit = defineEmits<{ close: [] }>();
const dialogElement = ref<HTMLDialogElement | null>(null);
const completed = ref(false);
const lineTotal = (line: CartLine) => (line.kind === 'purchase' ? line.manga.price : line.manga.rentalPrice * line.days) * line.quantity;
const total = computed(() => props.lines.reduce((sum, line) => sum + lineTotal(line), 0));
const close = () => { if (dialogElement.value?.open) dialogElement.value.close(); else emit('close'); };
const closeOnBackdrop = (event: MouseEvent) => { if (event.target === dialogElement.value) close(); };
onMounted(() => dialogElement.value?.showModal());
</script>

<style scoped>
.cart-checkout { width: min(560px,calc(100vw - 28px)); max-width:none; max-height:calc(100dvh - 28px); overflow:auto; border:1px solid var(--shop-line); border-radius:24px; background:var(--shop-surface); padding:0; color:var(--shop-ink); box-shadow:0 30px 90px rgba(30,30,26,.32); }
.cart-checkout::backdrop { background:rgba(24,27,24,.7); backdrop-filter:blur(5px); }
.cart-checkout__panel { position:relative; padding:30px; }
.cart-checkout__close { position:absolute; top:12px; right:12px; display:grid; width:38px; height:38px; place-items:center; border:1px solid var(--shop-line); border-radius:50%; background:var(--shop-surface); color:var(--shop-ink); cursor:pointer; font-size:1.45rem; }
.cart-checkout__badge { display:inline-flex; margin:0 0 12px; border-radius:999px; background:#f2e4c5; padding:7px 10px; color:#715017; font-size:.7rem; font-weight:850; letter-spacing:.04em; text-transform:uppercase; }
.cart-checkout h2 { margin:0; padding-right:25px; font:800 2rem/1.1 Georgia,'Times New Roman',serif; }
.cart-checkout__intro { margin:9px 0 19px; color:var(--shop-muted); font-size:.85rem; line-height:1.55; }
.cart-checkout__items { display:grid; gap:0; max-height:240px; overflow:auto; margin:0; border:1px solid var(--shop-line); border-radius:14px; padding:0 14px; list-style:none; }
.cart-checkout__items li { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:12px 0; border-bottom:1px solid var(--shop-line); }
.cart-checkout__items li:last-child { border:0; }
.cart-checkout__items span,.cart-checkout__items strong,.cart-checkout__items small { display:block; }
.cart-checkout__items strong { font-size:.8rem; }
.cart-checkout__items small { margin-top:4px; color:var(--shop-muted); font-size:.72rem; }
.cart-checkout__items li>b { flex:0 0 auto; color:var(--shop-green); font-size:.85rem; }
.cart-checkout__total { display:flex; justify-content:space-between; align-items:center; margin-top:14px; padding:14px 2px; font-size:.85rem; font-weight:800; }
.cart-checkout__total strong { color:var(--shop-accent); font-size:1.25rem; }
.cart-checkout__method { display:flex; align-items:center; gap:11px; border:1px solid rgba(49,91,76,.5); border-radius:13px; padding:12px; }
.cart-checkout__method>span { display:grid; width:37px; height:37px; place-items:center; border-radius:10px; background:#e2ecdf; color:var(--shop-green); font-size:1.3rem; }
.cart-checkout__method div { display:grid; gap:3px; }
.cart-checkout__method strong { font-size:.81rem; }
.cart-checkout__method small { color:var(--shop-muted); font-size:.71rem; }
.cart-checkout__method>b { display:grid; width:22px; height:22px; place-items:center; margin-left:auto; border-radius:50%; background:var(--shop-green); color:white; font-size:.76rem; }
.cart-checkout__notice { margin:14px 0; border-left:3px solid var(--shop-accent); padding:8px 0 8px 11px; color:#735a4f; font-size:.75rem; line-height:1.6; }
.cart-checkout__submit { width:100%; min-height:48px; border:0; border-radius:999px; background:var(--shop-ink); color:white; cursor:pointer; font:inherit; font-size:.85rem; font-weight:800; }
.cart-checkout__submit:hover { background:var(--shop-green); }
.cart-checkout__success { padding:22px 3px 8px; text-align:center; }
.cart-checkout__success>span { display:grid; width:62px; height:62px; place-items:center; margin:0 auto 18px; border-radius:50%; background:#e2ecdf; color:var(--shop-green); font-size:1.75rem; font-weight:800; }
.cart-checkout__success>p:not(.cart-checkout__badge) { margin:12px 0 22px; color:var(--shop-muted); font-size:.9rem; line-height:1.6; }
@media(max-width:520px) { .cart-checkout__panel { padding:27px 19px 22px; } .cart-checkout h2 { font-size:1.7rem; } }
</style>
