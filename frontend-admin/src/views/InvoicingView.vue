<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import AdminDialog from '../components/AdminDialog.vue';
import RentalActions from '../components/RentalActions.vue';
import { useRentalStore } from '../stores/rentalStore';
import { useBusinessStore } from '../stores/businessStore';
import { customerName, dateTime, money } from '../services/format';
import type { Invoice } from '../types/Business';
const rentals = useRentalStore();
const business = useBusinessStore();
const route = useRoute();
const search = ref('');
const filter = ref('all');
const selected = ref<Invoice | null>(null);
const printing = ref(false);
const load = () => Promise.all([rentals.fetchRentals(), business.fetchInvoices()]);
const invoiceFor = (id: string) => business.invoices.find(invoice => invoice.rental?._id === id);
const rows = computed(() => rentals.rentals.filter(rental => {
  if (route.query.rental && rental._id !== route.query.rental) return false;
  if (filter.value === 'unpaid' && rental.isPaid || filter.value === 'paid' && !rental.isPaid || filter.value === 'unissued' && invoiceFor(rental._id)) return false;
  return [customerName(rental), rental.manga?.title, invoiceFor(rental._id)?.number].join(' ').toLowerCase().includes(search.value.trim().toLowerCase());
}));
const received = computed(() => rentals.rentals.filter(r => r.isPaid).reduce((sum, r) => sum + r.cost, 0));
const pending = computed(() => rentals.rentals.filter(r => !r.isPaid).reduce((sum, r) => sum + r.cost, 0));
const selectedPayment = computed(() => rentals.rentals.find(r => r._id === selected.value?.rental?._id) || selected.value?.rental);
const issue = async (id: string) => { selected.value = invoiceFor(id) || await business.issueInvoice(id); };
const print = () => { printing.value = true; try { window.print(); } finally { printing.value = false; } };
onMounted(load);
</script>
<template>
  <div class="admin-page">
    <header class="admin-page-header"><div><p class="admin-eyebrow">Invoicing</p><h1>Cobros y comprobantes</h1><p>Registra pagos recibidos y emite un comprobante interno por alquiler.</p></div><button class="admin-button secondary" :disabled="rentals.loading || business.loading || !!rentals.busy || business.saving" @click="load">Actualizar</button></header>
    <div class="admin-stats"><article><span>Cobrado</span><strong>{{ money(received) }}</strong></article><article><span>Por cobrar</span><strong>{{ money(pending) }}</strong></article><article><span>Comprobantes emitidos</span><strong>{{ business.invoices.length }}</strong></article></div>
    <p class="admin-note">Los comprobantes son internos, sin validez fiscal. Registrar un pago confirma un cobro recibido por el negocio; no ejecuta un cargo en línea.</p>
    <div class="admin-toolbar"><label class="admin-search"><span class="sr-only">Buscar cobro</span><input v-model="search" type="search" placeholder="Cliente, manga o número de comprobante"></label><label><span class="sr-only">Filtrar cobros</span><select v-model="filter"><option value="all">Todos los cobros</option><option value="unpaid">Por cobrar</option><option value="paid">Pagados</option><option value="unissued">Sin comprobante</option></select></label><router-link v-if="route.query.rental" to="/invoicing">Quitar filtro de alquiler</router-link></div>
    <p v-if="rentals.error || business.error" class="admin-alert" role="alert">{{ rentals.error || business.error }}</p>
    <p v-if="rentals.loading || business.loading" class="admin-empty" role="status">Cargando cobros…</p>
    <div v-else class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Cliente / Concepto</th><th>Importe</th><th>Pago</th><th>Comprobante</th><th>Acciones</th></tr></thead><tbody>
      <tr v-for="rental in rows" :key="rental._id"><td><strong>{{ customerName(rental) }}</strong><small>Alquiler · {{ rental.manga?.title }} · Vol. {{ rental.manga?.volume }}</small></td><td>{{ money(rental.cost) }}</td><td><span class="admin-badge" :class="rental.isPaid ? 'good' : 'warn'">{{ rental.isPaid ? 'Pagado' : 'Pendiente' }}</span><small v-if="rental.paidAt">{{ dateTime(rental.paidAt) }}</small></td><td><span class="invoice-number">{{ invoiceFor(rental._id)?.number || 'Sin emitir' }}</span><button class="admin-sub-link" :disabled="business.saving" @click="issue(rental._id)">{{ invoiceFor(rental._id) ? 'Ver / imprimir' : 'Emitir comprobante' }}</button></td><td><RentalActions :rental="rental" payment-only /></td></tr>
      <tr v-if="!rows.length"><td colspan="5" class="admin-empty">No hay cobros para estos filtros.</td></tr>
    </tbody></table></div>
    <AdminDialog v-if="selected" title="Comprobante interno" printable @close="selected = null">
      <article class="invoice-document">
        <header><p class="admin-eyebrow">Comprobante interno · Sin validez fiscal</p><h2>{{ selected.issuer.businessName }}</h2><p>{{ selected.issuer.address }}</p><p>{{ [selected.issuer.contactEmail, selected.issuer.phone].filter(Boolean).join(' · ') }}</p></header>
        <div class="invoice-meta"><p><strong>Número</strong><span class="invoice-number">{{ selected.number }}</span></p><p><strong>Emisión</strong>{{ dateTime(selected.issuedAt) }}</p></div>
        <section><h3>Cliente</h3><p>{{ selected.customer.name }}</p><p>{{ selected.customer.email }}</p><p>{{ selected.customer.address }}</p></section>
        <section><h3>Concepto</h3><p>Alquiler de {{ selected.item.title }} · Vol. {{ selected.item.volume }}</p><p>{{ dateTime(selected.item.startDate) }} → {{ dateTime(selected.item.dueDate) }}</p></section>
        <div class="invoice-total"><span>Total</span><strong>{{ money(selected.amount) }}</strong></div>
        <p><strong>Estado del pago:</strong> {{ selectedPayment?.isPaid ? 'Pagado' : 'Pendiente' }}<span v-if="selectedPayment?.paidAt"> · {{ dateTime(selectedPayment.paidAt) }}</span></p>
        <p class="admin-muted">Documento de control interno de alquileres.</p>
      </article>
      <footer class="admin-actions no-print"><button class="admin-button secondary" @click="selected = null">Cerrar</button><button class="admin-button" :disabled="printing" @click="print">Imprimir / guardar PDF</button></footer>
    </AdminDialog>
  </div>
</template>
