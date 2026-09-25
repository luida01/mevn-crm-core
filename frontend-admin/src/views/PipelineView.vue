<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRentalStore } from '../stores/rentalStore';
import RentalForm from '../components/RentalForm.vue';
import RentalActions from '../components/RentalActions.vue';
import { customerName, money, dateTime, rentalStatus } from '../services/format';
import type { Rental } from '../types/Rental';
const store = useRentalStore();
const search = ref('');
const showForm = ref(false);
const lanes = [
  { id: 'active', name: 'En curso', description: 'Ejemplares en manos de lectores', color: 'purple' },
  { id: 'late', name: 'Vencidos', description: 'Devolución pendiente fuera de plazo', color: 'red' },
  { id: 'collect', name: 'Por cobrar', description: 'Devueltos con pago pendiente', color: 'amber' },
  { id: 'done', name: 'Cerrados', description: 'Devueltos y pagados', color: 'green' }
];
const laneOf = (rental: Rental) => rental.status === 'RETURNED' ? rental.isPaid ? 'done' : 'collect' : rentalStatus(rental) === 'LATE' ? 'late' : 'active';
const items = computed(() => store.rentals.filter(r => [customerName(r), r.manga?.title].join(' ').toLowerCase().includes(search.value.trim().toLowerCase())));
const inLane = (id: string) => items.value.filter(r => laneOf(r) === id);
const balance = computed(() => store.rentals.filter(r => !r.isPaid).reduce((sum, r) => sum + r.cost, 0));
onMounted(() => store.fetchRentals());
</script>
<template>
  <div class="admin-page admin-page--wide">
    <header class="admin-page-header"><div><p class="admin-eyebrow">Seguimiento</p><h1>Pipeline de alquileres</h1><p>El tablero avanza al registrar una devolución o un pago.</p></div><button class="admin-button" @click="showForm = true">+ Nuevo alquiler</button></header>
    <div class="admin-toolbar"><label class="admin-search"><span class="sr-only">Buscar en el tablero</span><input v-model="search" type="search" placeholder="Buscar cliente o manga"></label><span class="admin-muted">Saldo total por cobrar: <strong>{{ money(balance) }}</strong></span><button class="admin-button secondary" :disabled="store.loading || !!store.busy" @click="store.fetchRentals()">Actualizar</button></div>
    <p v-if="store.error" class="admin-alert" role="alert">{{ store.error }}</p>
    <p v-if="store.loading" class="admin-empty" role="status">Actualizando tablero…</p>
    <div v-else class="pipeline-board">
      <section v-for="lane in lanes" :key="lane.id" class="pipeline-lane" :class="lane.color">
        <header><h2>{{ lane.name }} <span>{{ inLane(lane.id).length }}</span></h2><p>{{ lane.description }}</p></header>
        <article v-for="rental in inLane(lane.id)" :key="rental._id" class="pipeline-card">
          <div class="pipeline-card__heading"><strong>{{ rental.manga?.title || 'Manga no disponible' }}</strong><span>Vol. {{ rental.manga?.volume }}</span></div>
          <p>{{ customerName(rental) }}</p><small>Vence: {{ dateTime(rental.dueDate) }}</small>
          <div class="pipeline-card__amount"><strong>{{ money(rental.cost) }}</strong><span class="admin-badge" :class="rental.isPaid ? 'good' : 'warn'">{{ rental.isPaid ? 'Pagado' : 'Por cobrar' }}</span></div>
          <RentalActions :rental="rental" />
          <router-link class="admin-sub-link" :to="{ path: '/invoicing', query: { rental: rental._id } }">Ver comprobante →</router-link>
        </article>
        <p v-if="!inLane(lane.id).length" class="pipeline-empty">Sin alquileres en esta etapa.</p>
      </section>
    </div>
    <RentalForm v-if="showForm" @close="showForm = false" />
  </div>
</template>
