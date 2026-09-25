<script setup lang="ts">
import { onMounted, ref, useId } from 'vue';
const props = defineProps<{ title: string; busy?: boolean; printable?: boolean }>();
const emit = defineEmits<{ close: [] }>();
const dialog = ref<HTMLDialogElement | null>(null);
const titleId = useId();
const close = () => { if (!props.busy) dialog.value?.close(); };
onMounted(() => dialog.value?.showModal());
</script>
<template>
  <Teleport to="body">
    <dialog ref="dialog" class="admin-dialog" :class="{ 'print-document': printable }" :aria-labelledby="titleId" @cancel.prevent="close" @close="emit('close')" @click="event => { if (event.target === dialog) close(); }">
      <header class="admin-dialog__header no-print"><h2 :id="titleId">{{ title }}</h2><button type="button" class="admin-icon-button" :disabled="busy" aria-label="Cerrar" autofocus @click="close">×</button></header>
      <div class="admin-dialog__body"><slot /></div>
    </dialog>
  </Teleport>
</template>

