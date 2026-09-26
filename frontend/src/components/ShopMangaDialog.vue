<template>
  <Teleport to="body">
    <dialog
      ref="dialogElement"
      class="shop-manga-dialog"
      :aria-labelledby="titleId"
      @cancel.prevent="close"
      @close="emit('close')"
      @click="closeOnBackdrop"
    >
      <div class="shop-manga-dialog__layout">
      <button class="shop-manga-dialog__close" type="button" :aria-label="t('details.close')" autofocus @click="close">×</button>
        <div class="shop-manga-dialog__cover">
          <img :src="manga.coverImage || '/no-cover.svg'" :alt="`Portada de ${manga.title}`" @error="handleCoverError">
        </div>
        <div class="shop-manga-dialog__content">
          <p class="shop-manga-dialog__eyebrow">{{ t('details.volume') }} {{ manga.volume }} <span aria-hidden="true">·</span> {{ manga.genre || 'Manga' }}</p>
          <h2 :id="titleId">{{ manga.title }}</h2>
          <p class="shop-manga-dialog__author">{{ manga.author }}<span v-if="manga.publishedYear"> · {{ manga.publishedYear }}</span></p>
          <div v-if="manga.malScore" class="shop-manga-dialog__score">★ {{ manga.malScore.toFixed(1) }} <span>{{ t('details.rating') }}</span></div>
          <p class="shop-manga-dialog__description">{{ manga.description || t('details.noSynopsis') }}</p>
          <div class="shop-manga-dialog__prices">
            <div><span>{{ t('details.rentalDay') }}</span><strong>${{ manga.rentalPrice }}</strong></div>
            <div><span>{{ t('details.purchase') }}</span><strong>${{ manga.price }}</strong></div>
          </div>
          <p class="shop-manga-dialog__stock" :class="{ 'shop-manga-dialog__stock--empty': manga.stock < 1 }">
            <span aria-hidden="true">{{ manga.stock > 0 ? '●' : '○' }}</span>
            {{ manga.stock > 0 ? `${manga.stock} ${t(manga.stock === 1 ? 'details.oneAvailable' : 'details.manyAvailable')}` : t('details.noneAvailable') }}
          </p>
          <p class="shop-manga-dialog__note">{{ t('details.note') }}</p>
          <div class="shop-manga-dialog__actions">
            <button type="button" class="shop-manga-dialog__rent" :disabled="manga.stock < 1 || manga.rentalPrice <= 0" @click="emit('addToCart', 'rental')">{{ t('details.addRental') }}</button>
            <button type="button" class="shop-manga-dialog__buy" :disabled="manga.stock < 1 || manga.price <= 0" @click="emit('addToCart', 'purchase')">{{ t('details.addPurchase') }}</button>
          </div>
          <button class="shop-manga-dialog__return" type="button" @click="close">{{ t('details.back') }} <span aria-hidden="true">↗</span></button>
        </div>
      </div>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Manga } from '../types/Manga';
import { t } from '../i18n';

const props = defineProps<{ manga: Manga }>();
const emit = defineEmits<{ close: []; addToCart: [kind: 'rental' | 'purchase'] }>();
const dialogElement = ref<HTMLDialogElement | null>(null);
const titleId = `shop-manga-title-${props.manga._id ?? 'preview'}`;

const close = () => {
  if (dialogElement.value?.open) dialogElement.value.close();
  else emit('close');
};

const closeOnBackdrop = (event: MouseEvent) => {
  if (event.target === dialogElement.value) close();
};

const handleCoverError = (event: Event) => {
  const image = event.currentTarget as HTMLImageElement;
  image.onerror = null;
  image.src = '/no-cover.svg';
};

onMounted(() => dialogElement.value?.showModal());
</script>

<style scoped>
.shop-manga-dialog {
  width: min(880px, calc(100vw - 32px));
  max-width: none;
  max-height: min(760px, calc(100dvh - 32px));
  overflow: auto;
  border: 1px solid var(--shop-line);
  border-radius: 25px;
  background: var(--shop-surface);
  padding: 0;
  color: var(--shop-ink);
  box-shadow: 0 30px 90px rgba(30, 30, 26, 0.3);
}

.shop-manga-dialog::backdrop {
  background: rgba(24, 27, 24, 0.68);
  backdrop-filter: blur(5px);
}

.shop-manga-dialog__layout {
  position: relative;
  display: grid;
  grid-template-columns: minmax(235px, 0.82fr) minmax(0, 1.18fr);
  gap: clamp(25px, 5vw, 48px);
  padding: 30px;
}

.shop-manga-dialog__close {
  position: absolute;
  z-index: 1;
  top: 14px;
  right: 14px;
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 1px solid var(--shop-line);
  border-radius: 50%;
  background: var(--shop-surface);
  color: var(--shop-ink);
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
}

.shop-manga-dialog__cover {
  align-self: stretch;
  min-height: 360px;
  overflow: hidden;
  border-radius: 17px;
  background: var(--shop-paper-deep);
}

.shop-manga-dialog__cover img { width: 100%; height: 100%; object-fit: cover; }
.shop-manga-dialog__content { align-self: center; padding: 14px 8px 10px 0; }
.shop-manga-dialog__eyebrow { margin: 0 0 12px; color: var(--shop-green); font-size: 0.76rem; font-weight: 800; letter-spacing: 0.11em; text-transform: uppercase; }
.shop-manga-dialog__content h2 { margin: 0; padding-right: 30px; color: var(--shop-ink); font-family: Georgia, 'Times New Roman', serif; font-size: clamp(2rem, 4vw, 3rem); line-height: 1.05; }
.shop-manga-dialog__author { margin: 10px 0 0; color: var(--shop-muted); font-size: 0.92rem; }
.shop-manga-dialog__score { display: inline-flex; align-items: center; gap: 7px; margin-top: 15px; border-radius: 999px; background: #f2e4c5; padding: 7px 11px; color: #715017; font-size: 0.83rem; font-weight: 800; }
.shop-manga-dialog__score span { color: #786f5f; font-size: 0.7rem; font-weight: 600; }
.shop-manga-dialog__description { max-height: 150px; overflow: auto; margin: 20px 0; color: #62645c; font-size: 0.9rem; line-height: 1.75; white-space: pre-line; }
.shop-manga-dialog__prices { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.shop-manga-dialog__prices div { border: 1px solid var(--shop-line); border-radius: 13px; padding: 12px; }
.shop-manga-dialog__prices span,.shop-manga-dialog__prices strong { display: block; }
.shop-manga-dialog__prices span { color: var(--shop-muted); font-size: 0.72rem; }
.shop-manga-dialog__prices strong { margin-top: 4px; color: var(--shop-accent); font-size: 1.13rem; }
.shop-manga-dialog__stock { margin: 13px 0 0; color: var(--shop-green); font-size: 0.81rem; font-weight: 750; }
.shop-manga-dialog__stock--empty { color: #8c5b43; }
.shop-manga-dialog__stock span { margin-right: 6px; font-size: 0.68rem; }
.shop-manga-dialog__note { margin: 15px 0; border-left: 3px solid var(--shop-gold); padding: 9px 0 9px 12px; color: var(--shop-muted); font-size: 0.76rem; line-height: 1.55; }
.shop-manga-dialog__actions { display: flex; flex-wrap: wrap; gap: 9px; }
.shop-manga-dialog__actions button { min-height: 42px; border: 0; border-radius: 999px; padding: 0 16px; color: #fffdf8; cursor: pointer; font: inherit; font-size: 0.79rem; font-weight: 800; transition: transform 160ms ease, opacity 160ms ease; }
.shop-manga-dialog__actions button:hover:not(:disabled) { transform: translateY(-2px); }
.shop-manga-dialog__rent { background: var(--shop-green); }
.shop-manga-dialog__buy { background: var(--shop-accent); }
.shop-manga-dialog__actions button:disabled { cursor: not-allowed; opacity: 0.45; }
.shop-manga-dialog__return { display: inline-flex; align-items: center; gap: 9px; border: 0; background: transparent; padding: 7px 0; color: var(--shop-green); cursor: pointer; font: inherit; font-size: 0.86rem; font-weight: 800; }

@media (max-width: 640px) {
  .shop-manga-dialog { width: calc(100vw - 20px); max-height: calc(100dvh - 20px); border-radius: 20px; }
  .shop-manga-dialog__layout { grid-template-columns: 1fr; gap: 18px; padding: 12px 17px 20px; }
  .shop-manga-dialog__cover { width: min(64vw, 240px); height: auto; min-height: 0; aspect-ratio: 2 / 3; justify-self: center; margin-top: 43px; }
  .shop-manga-dialog__content { padding: 0; }
  .shop-manga-dialog__content h2 { font-size: 2rem; }
  .shop-manga-dialog__description { max-height: 120px; margin-block: 14px; }
}
</style>
