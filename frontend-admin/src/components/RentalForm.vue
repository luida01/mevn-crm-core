<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AdminDialog from './AdminDialog.vue';
import { useRentalStore } from '../stores/rentalStore';
import { useCustomerStore } from '../stores/customerStore';
import { useMangaStore } from '../stores/mangaStore';
import { useBusinessStore } from '../stores/businessStore';
import { money } from '../services/format';
const emit = defineEmits<{ close: [] }>();
const rentalStore = useRentalStore();
const customerStore = useCustomerStore();
const mangaStore = useMangaStore();
const business = useBusinessStore();
const loading = ref(true);
const form = ref({ customerId: '', mangaId: '', dueDate: '', isPaid: false });
rentalStore.error = null;
const availableMangas = computed(() => mangaStore.mangas.filter(m => m.stock > 0));
const activeCustomers = computed(() => customerStore.customers.filter(c => c.isActive));
const selectedManga = computed(() => availableMangas.value.find(m => m._id === form.value.mangaId));
const days = computed(() => Math.max(1, Math.ceil((new Date(form.value.dueDate).getTime() - Date.now()) / 86400000)) || 1);
const total = computed(() => (selectedManga.value?.rentalPrice || 0) * days.value);
const localDateTime = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0,16);
const minDate = localDateTime(new Date(Date.now() + 60000));
onMounted(async () => {
  await Promise.all([customerStore.fetchCustomers(), mangaStore.fetchMangas(), business.fetchSettings()]);
  const due = new Date();
  due.setDate(due.getDate() + business.settings.defaultRentalDays);
  form.value.dueDate = localDateTime(due);
  loading.value = false;
});
const submit = async () => {
  if (await rentalStore.createRental({ ...form.value, dueDate: new Date(form.value.dueDate).toISOString() })) emit('close');
};
</script>
<template>
  <AdminDialog title="Nuevo alquiler" :busy="!!rentalStore.busy" @close="emit('close')">
    <p v-if="loading" role="status">Cargando clientes e inventario…</p>
    <p v-if="rentalStore.error || customerStore.error || mangaStore.error || business.error" class="admin-alert" role="alert">{{ rentalStore.error || customerStore.error || mangaStore.error || business.error }}</p>
    <form v-if="!loading" class="admin-form" @submit.prevent="submit">
      <label>Cliente activo<select v-model="form.customerId" required><option value="" disabled>Selecciona un cliente</option><option v-for="customer in activeCustomers" :key="customer._id" :value="customer._id">{{ customer.firstName }} {{ customer.lastName }} · {{ customer.email }}</option></select></label>
      <p v-if="!activeCustomers.length" class="admin-muted">Crea o activa un cliente en Clientes para continuar.</p>
      <label>Manga disponible<select v-model="form.mangaId" required><option value="" disabled>Selecciona un volumen</option><option v-for="manga in availableMangas" :key="manga._id" :value="manga._id">{{ manga.title }} · Vol. {{ manga.volume }} · {{ manga.stock }} disponibles</option></select></label>
      <p v-if="!availableMangas.length" class="admin-muted">No hay stock disponible. Actualiza las unidades desde Mangas.</p>
      <label>Fecha y hora de devolución<input v-model="form.dueDate" type="datetime-local" :min="minDate" required></label>
      <div class="admin-note" v-if="selectedManga">{{ days }} día(s) × {{ money(selectedManga.rentalPrice) }} = <strong>{{ money(total) }}</strong><small>Se cobra por día iniciado. El importe final se calcula al registrar el alquiler.</small></div>
      <label class="admin-checkbox"><input v-model="form.isPaid" type="checkbox"> Pago recibido</label>
      <footer class="admin-actions"><button type="button" class="admin-button secondary" :disabled="!!rentalStore.busy" @click="emit('close')">Cancelar</button><button class="admin-button" :disabled="!!rentalStore.busy || !availableMangas.length || !activeCustomers.length">{{ rentalStore.busy ? 'Registrando…' : 'Registrar alquiler' }}</button></footer>
    </form>
  </AdminDialog>
</template>
