<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useCustomerStore } from '../stores/customerStore';
import { useMangaStore } from '../stores/mangaStore';
import { useRentalStore } from '../stores/rentalStore';
import { rentalStatus, money } from '../services/format';
const customers = useCustomerStore(); const mangas = useMangaStore(); const rentals = useRentalStore();
const apps = [
  { name: 'Clientes', icon: '👥', route: '/customers', description: 'Contacto e historial de tus lectores.' },
  { name: 'Mangas', icon: '📚', route: '/mangas', description: 'Volúmenes, precios y existencias.' },
  { name: 'Alquileres', icon: '📖', route: '/rentals', description: 'Altas, devoluciones y vencimientos.' },
  { name: 'Pipeline', icon: '📊', route: '/pipeline', description: 'Seguimiento de cada alquiler.' },
  { name: 'Cobros', icon: '🧾', route: '/invoicing', description: 'Pagos y comprobantes internos.' },
  { name: 'Configuración', icon: '⚙️', route: '/settings', description: 'Datos del negocio y preferencias.' }
];
const active = computed(() => rentals.rentals.filter(r => r.status !== 'RETURNED').length);
const late = computed(() => rentals.rentals.filter(r => rentalStatus(r) === 'LATE').length);
const pending = computed(() => rentals.rentals.filter(r => !r.isPaid).reduce((sum, r) => sum + r.cost, 0));
const load = () => Promise.all([customers.fetchCustomers(), mangas.fetchMangas(), rentals.fetchRentals()]);
onMounted(load);
</script>
<template>
  <div class="admin-page">
    <header class="admin-page-header"><div><p class="admin-eyebrow">MangaGo · Administración</p><h1>Tu tienda, al día.</h1><p>Inventario, lectores y operaciones en un mismo lugar.</p></div><button class="admin-button secondary" :disabled="customers.loading || mangas.loading || rentals.loading" @click="load">Actualizar</button></header>
    <p v-if="customers.error || mangas.error || rentals.error" class="admin-alert" role="alert">{{ customers.error || mangas.error || rentals.error }}</p>
    <p v-if="customers.loading || mangas.loading || rentals.loading" class="admin-muted" role="status">Actualizando resumen…</p>
    <div class="admin-stats"><article><span>Clientes</span><strong>{{ customers.customers.length }}</strong></article><article><span>Volúmenes</span><strong>{{ mangas.mangas.length }}</strong></article><article><span>En alquiler</span><strong>{{ active }}</strong></article><article><span>Por cobrar</span><strong>{{ money(pending) }}</strong></article></div>
    <router-link v-if="late" class="admin-alert block" to="/rentals?status=LATE">{{ late }} alquiler(es) vencido(s). Revisar devoluciones →</router-link>
    <div class="admin-app-grid"><router-link v-for="app in apps" :key="app.route" :to="app.route" class="admin-app-card"><span aria-hidden="true">{{ app.icon }}</span><h2>{{ app.name }}</h2><p>{{ app.description }}</p><b aria-hidden="true">↗</b></router-link></div>
  </div>
</template>
