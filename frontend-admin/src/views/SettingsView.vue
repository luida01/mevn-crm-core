<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useBusinessStore } from '../stores/businessStore';
import type { BusinessSettings } from '../types/Business';
const store = useBusinessStore();
const ready = ref(false);
const saved = ref(false);
const form = ref<BusinessSettings>({ ...store.settings });
const load = async () => {
  ready.value = false;
  if (await store.fetchSettings()) { form.value = { ...store.settings }; ready.value = true; }
};
const save = async () => { saved.value = await store.saveSettings(form.value); };
onMounted(load);
</script>
<template>
  <div class="admin-page">
    <header class="admin-page-header"><div><p class="admin-eyebrow">Preferencias del negocio</p><h1>Configuración</h1><p>Datos para nuevos comprobantes y valores iniciales para los alquileres.</p></div></header>
    <p v-if="store.error" class="admin-alert" role="alert">{{ store.error }} <button type="button" class="admin-text-button" @click="load">Reintentar</button></p>
    <p v-if="!ready && !store.error" class="admin-empty" role="status">Cargando configuración…</p>
    <form v-if="ready" class="admin-form admin-card settings-form" @submit.prevent="save" @input="saved = false">
      <h2>Datos del negocio</h2>
      <div class="admin-form-grid">
        <label class="span-2">Nombre del negocio<input v-model.trim="form.businessName" required maxlength="120"></label>
        <label>Correo de contacto<input v-model.trim="form.contactEmail" type="email" maxlength="254"></label>
        <label>Teléfono<input v-model.trim="form.phone" type="tel" maxlength="40"></label>
        <label class="span-2">Dirección<textarea v-model.trim="form.address" rows="2" maxlength="300"></textarea></label>
      </div>
      <p class="admin-muted">Estos datos aparecen en los próximos comprobantes. Los emitidos conservan sus datos originales.</p>
      <hr><h2>Alquileres</h2>
      <label>Días sugeridos de alquiler<input v-model.number="form.defaultRentalDays" type="number" min="1" max="90" step="1" required></label>
      <p class="admin-muted">La fecha se precarga al crear un alquiler y puedes ajustarla antes de guardarlo. Los precios se toman del inventario.</p>
      <p v-if="saved" class="admin-success" role="status">Configuración guardada.</p>
      <footer class="admin-actions"><button class="admin-button" :disabled="store.saving">{{ store.saving ? 'Guardando…' : 'Guardar configuración' }}</button></footer>
    </form>
  </div>
</template>
