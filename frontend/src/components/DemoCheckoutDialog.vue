<template>
  <Teleport to="body">
    <dialog ref="dialogElement" class="demo-checkout" :aria-labelledby="titleId" @cancel.prevent="close" @close="emit('close')" @click="closeOnBackdrop">
      <section class="demo-checkout__panel">
        <button class="demo-checkout__close" type="button" aria-label="Cerrar pago de demostración" autofocus @click="close">×</button>
        <div v-if="!completed" class="demo-checkout__body">
          <p class="demo-checkout__badge"><span aria-hidden="true">◉</span> Modo demostración</p>
          <h2 :id="titleId">Revisa tu {{ kind === 'rental' ? 'alquiler' : 'compra' }}</h2>
          <p class="demo-checkout__subtitle">{{ manga.title }} · Volumen {{ manga.volume }}</p>

          <div class="demo-checkout__summary">
            <div><span>Operación de prueba</span><strong>{{ kind === 'rental' ? 'Alquiler' : 'Compra' }}</strong></div>
            <label v-if="kind === 'rental'" class="demo-checkout__days">
              <span>Días (solo para la simulación)</span>
              <input v-model.number="days" type="number" min="1" max="30" inputmode="numeric">
            </label>
            <div><span>Ejemplar</span><strong>{{ manga.title }} #{{ manga.volume }}</strong></div>
            <div class="demo-checkout__total"><span>Total de ejemplo</span><strong>${{ total.toFixed(2) }}</strong></div>
          </div>

          <div class="demo-checkout__method" aria-label="Método de pago de demostración">
            <span class="demo-checkout__method-icon" aria-hidden="true">▤</span>
            <span><strong>Tarjeta de prueba</strong><small>Sin datos de tarjeta</small></span>
            <span class="demo-checkout__selected" aria-hidden="true">✓</span>
          </div>
          <p class="demo-checkout__notice">No ingreses datos de una tarjeta real. No hay un proveedor conectado: este botón no cobra, no crea un pedido y no envía ni guarda información de pago.</p>
          <button class="demo-checkout__submit" type="button" @click="completed = true">Simular pago · ${{ total.toFixed(2) }}</button>
          <button class="demo-checkout__back" type="button" @click="close">Volver al catálogo</button>
        </div>

        <div v-else class="demo-checkout__success" role="status" aria-live="polite">
          <span class="demo-checkout__success-mark" aria-hidden="true">✓</span>
          <p class="demo-checkout__badge">Prueba completada</p>
          <h2>Pago simulado</h2>
          <p>No se realizó ningún cobro ni se registró un pedido.</p>
          <button class="demo-checkout__submit" type="button" @click="close">Volver al catálogo</button>
        </div>
      </section>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { Manga } from '../types/Manga';

const props = defineProps<{ manga: Manga; kind: 'rental' | 'purchase' }>();
const emit = defineEmits<{ close: [] }>();
const dialogElement = ref<HTMLDialogElement | null>(null);
const days = ref(1);
const completed = ref(false);
const titleId = `demo-checkout-title-${props.manga._id ?? 'preview'}`;
const total = computed(() => {
  if (props.kind === 'purchase') return props.manga.price;
  const simulatedDays = Math.max(1, Math.min(30, Math.trunc(Number(days.value) || 1)));
  return props.manga.rentalPrice * simulatedDays;
});

const close = () => {
  if (dialogElement.value?.open) dialogElement.value.close();
  else emit('close');
};

const closeOnBackdrop = (event: MouseEvent) => {
  if (event.target === dialogElement.value) close();
};

onMounted(() => dialogElement.value?.showModal());
</script>

<style scoped>
.demo-checkout { width: min(500px, calc(100vw - 28px)); max-width: none; max-height: calc(100dvh - 28px); overflow: auto; border: 1px solid var(--shop-line); border-radius: 24px; background: var(--shop-surface); padding: 0; color: var(--shop-ink); box-shadow: 0 30px 90px rgba(30, 30, 26, 0.32); }
.demo-checkout::backdrop { background: rgba(24, 27, 24, 0.7); backdrop-filter: blur(5px); }
.demo-checkout__panel { position: relative; padding: 30px; }
.demo-checkout__close { position: absolute; top: 12px; right: 12px; display: grid; width: 38px; height: 38px; place-items: center; border: 1px solid var(--shop-line); border-radius: 50%; background: var(--shop-surface); color: var(--shop-ink); cursor: pointer; font-size: 1.45rem; }
.demo-checkout__badge { display: inline-flex; align-items: center; gap: 7px; margin: 0 0 13px; border-radius: 999px; background: #f2e4c5; padding: 7px 10px; color: #715017; font-size: 0.72rem; font-weight: 850; letter-spacing: 0.04em; text-transform: uppercase; }
.demo-checkout h2 { margin: 0; padding-right: 25px; color: var(--shop-ink); font-family: Georgia, 'Times New Roman', serif; font-size: 2rem; line-height: 1.1; }
.demo-checkout__subtitle { margin: 9px 0 21px; color: var(--shop-muted); font-size: 0.88rem; }
.demo-checkout__summary { display: grid; gap: 13px; border: 1px solid var(--shop-line); border-radius: 16px; background: #fbf7ef; padding: 16px; }
.demo-checkout__summary > div,.demo-checkout__days { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: var(--shop-muted); font-size: 0.79rem; }
.demo-checkout__summary strong { color: var(--shop-ink); font-size: 0.83rem; text-align: right; }
.demo-checkout__days input { width: 72px; border: 1px solid var(--shop-line); border-radius: 8px; background: white; padding: 7px 8px; color: var(--shop-ink); font: inherit; text-align: center; }
.demo-checkout__summary .demo-checkout__total { border-top: 1px solid var(--shop-line); padding-top: 12px; color: var(--shop-ink); font-weight: 800; }
.demo-checkout__total strong { color: var(--shop-accent); font-size: 1.14rem; }
.demo-checkout__method { display: flex; align-items: center; gap: 11px; margin-top: 15px; border: 1px solid rgba(49, 91, 76, 0.5); border-radius: 13px; padding: 12px; }
.demo-checkout__method-icon { display: grid; width: 37px; height: 37px; place-items: center; border-radius: 10px; background: #e2ecdf; color: var(--shop-green); font-size: 1.3rem; }
.demo-checkout__method > span:nth-child(2) { display: grid; gap: 3px; }
.demo-checkout__method strong { font-size: 0.81rem; }
.demo-checkout__method small { color: var(--shop-muted); font-size: 0.71rem; }
.demo-checkout__selected { display: grid; width: 22px; height: 22px; place-items: center; margin-left: auto; border-radius: 50%; background: var(--shop-green); color: white; font-size: 0.76rem; }
.demo-checkout__notice { margin: 14px 0; border-left: 3px solid var(--shop-accent); padding: 8px 0 8px 11px; color: #735a4f; font-size: 0.75rem; line-height: 1.6; }
.demo-checkout__submit { width: 100%; min-height: 48px; border: 0; border-radius: 999px; background: var(--shop-ink); color: white; cursor: pointer; font: inherit; font-size: 0.85rem; font-weight: 800; transition: background 150ms ease, transform 150ms ease; }
.demo-checkout__submit:hover { background: var(--shop-green); transform: translateY(-1px); }
.demo-checkout__back { display: block; margin: 10px auto 0; border: 0; background: transparent; color: var(--shop-muted); cursor: pointer; font: inherit; font-size: 0.8rem; }
.demo-checkout__success { padding: 22px 3px 8px; text-align: center; }
.demo-checkout__success-mark { display: grid; width: 62px; height: 62px; place-items: center; margin: 0 auto 18px; border-radius: 50%; background: #e2ecdf; color: var(--shop-green); font-size: 1.75rem; font-weight: 800; }
.demo-checkout__success p:not(.demo-checkout__badge) { margin: 12px 0 22px; color: var(--shop-muted); font-size: 0.9rem; line-height: 1.6; }
@media (max-width: 520px) { .demo-checkout__panel { padding: 27px 19px 22px; } .demo-checkout h2 { font-size: 1.7rem; } }
</style>
