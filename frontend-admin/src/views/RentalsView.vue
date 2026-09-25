<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useRentalStore } from '../stores/rentalStore';
import RentalForm from '../components/RentalForm.vue';
import RentalActions from '../components/RentalActions.vue';
import { money, dateTime, customerName, rentalStatus, statusLabel } from '../services/format';
const store = useRentalStore();
const route = useRoute();
const showForm = ref(false);
const search = ref('');
const status = ref(String(route.query.status || 'all'));
const payment = ref('all');
const customerId = ref(String(route.query.customer || ''));
watch(() => route.query, query => { customerId.value = String(query.customer || ''); status.value = String(query.status || 'all'); });
const filtered = computed(() => store.rentals.filter(rental => {
  if (customerId.value && rental.customer?._id !== customerId.value) return false;
  if (status.value !== 'all' && rentalStatus(rental) !== status.value) return false;
  if (payment.value === 'paid' && !rental.isPaid || payment.value === 'unpaid' && rental.isPaid) return false;
  const text = [customerName(rental), rental.customer?.email, rental.manga?.title, rental.manga?.volume].join(' ').toLowerCase();
  return text.includes(search.value.trim().toLowerCase());
}));
onMounted(() => store.fetchRentals());
</script>
<template>
  <div class="admin-page">
    <header class="admin-page-header"><div><p class="admin-eyebrow">Operaciones</p><h1>Alquileres</h1><p>Controla vencimientos, devoluciones y pagos de cada volumen.</p></div><button class="admin-button" @click="showForm = true">+ Nuevo alquiler</button></header>
    <div class="admin-toolbar">
      <label class="admin-search"><span class="sr-only">Buscar alquiler</span><input v-model="search" type="search" placeholder="Cliente, manga o volumen"></label>
      <label><span class="sr-only">Estado</span><select v-model="status"><option value="all">Todos los estados</option><option value="ACTIVE">En curso</option><option value="LATE">Vencidos</option><option value="RETURNED">Devueltos</option></select></label>
      <label><span class="sr-only">Pago</span><select v-model="payment"><option value="all">Todos los pagos</option><option value="paid">Pagados</option><option value="unpaid">Por cobrar</option></select></label>
      <button class="admin-button secondary" :disabled="store.loading || !!store.busy" @click="store.fetchRentals()">Actualizar</button>
    </div>
    <p v-if="customerId" class="admin-note">Mostrando alquileres del cliente seleccionado. <router-link to="/rentals">Ver todos</router-link></p>
    <p v-if="store.error" class="admin-alert" role="alert">{{ store.error }}</p>
    <p v-if="store.loading" class="admin-empty" role="status">Cargando alquileres…</p>
    <div v-else class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Cliente / Manga</th><th>Devolución prevista</th><th>Estado</th><th>Importe</th><th>Acciones</th></tr></thead>
      <tbody><tr v-for="rental in filtered" :key="rental._id">
        <td><strong>{{ customerName(rental) }}</strong><small>{{ rental.manga?.title || 'Manga no disponible' }} · Vol. {{ rental.manga?.volume }}</small></td>
        <td>{{ dateTime(rental.dueDate) }}<small v-if="rental.returnDate">Devuelto: {{ dateTime(rental.returnDate) }}</small></td>
        <td><span class="admin-badge" :class="{ 'danger': rentalStatus(rental) === 'LATE', 'good': rental.status === 'RETURNED' }">{{ statusLabel(rentalStatus(rental)) }}</span></td>
        <td><strong>{{ money(rental.cost) }}</strong><small>{{ rental.isPaid ? 'Pagado' : 'Por cobrar' }}</small></td>
        <td><RentalActions :rental="rental" /><router-link class="admin-sub-link" :to="{ path: '/invoicing', query: { rental: rental._id } }">Ver cobro y comprobante →</router-link></td>
      </tr><tr v-if="!filtered.length"><td colspan="5" class="admin-empty">No hay alquileres para estos filtros.</td></tr></tbody>
    </table></div>
    <RentalForm v-if="showForm" @close="showForm = false" />
  </div>
</template>
