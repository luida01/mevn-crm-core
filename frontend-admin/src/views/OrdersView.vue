<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import AdminDialog from '../components/AdminDialog.vue';
import api from '../services/api';
import { dateTime, money } from '../services/format';

type ReceiptItem = { title: string; author: string; volume: number; kind: 'purchase' | 'rental'; quantity: number; days: number | null; unitAmount: number; lineTotal: number };
type Receipt = { number: string; issuedAt: string; fiscal: false; issuer: { businessName: string; contactEmail?: string; phone?: string; address?: string }; customer: { name: string; email: string }; items: ReceiptItem[]; currency: string; total: number; payment: { provider: string; paymentIntentId?: string | null } };
type Order = { _id: string; status: 'pending' | 'paid' | 'expired' | 'cancelled' | 'failed'; currency: string; items: ReceiptItem[]; total: number; customer: { name: string; email: string }; createdAt: string; paidAt?: string; receipt?: Receipt };
const orders = ref<Order[]>([]);
const loading = ref(false);
const error = ref('');
const search = ref('');
const filter = ref('all');
const selected = ref<Order | null>(null);
const rows = computed(() => orders.value.filter(order => (filter.value === 'all' || order.status === filter.value) &&
  `${order._id} ${order.customer.name} ${order.customer.email} ${order.receipt?.number || ''}`.toLowerCase().includes(search.value.trim().toLowerCase())));
const load = async () => { loading.value = true; error.value = ''; try { orders.value = (await api.get<Order[]>('/orders')).data; } catch { error.value = 'No se pudieron cargar los pedidos. Vuelve a iniciar sesión e inténtalo de nuevo.'; } finally { loading.value = false; } };
const statusLabel: Record<Order['status'], string> = { pending: 'Pendiente', paid: 'Pagado', expired: 'Vencido', cancelled: 'Cancelado', failed: 'Fallido' };
const print = () => window.print();
onMounted(load);
</script>

<template>
  <div class="admin-page">
    <header class="admin-page-header"><div><p class="admin-eyebrow">Tienda en línea</p><h1>Pedidos</h1><p>Checkout mixto, reservas de stock y comprobantes internos de Stripe en modo de prueba.</p></div><button class="admin-button secondary" :disabled="loading" @click="load">Actualizar</button></header>
    <div class="admin-toolbar"><label class="admin-search"><span class="sr-only">Buscar pedido</span><input v-model="search" type="search" placeholder="Cliente, correo o número de pedido"></label><label><span class="sr-only">Filtrar pedidos</span><select v-model="filter"><option value="all">Todos los estados</option><option value="pending">Pendientes</option><option value="paid">Pagados</option><option value="expired">Vencidos</option><option value="cancelled">Cancelados</option><option value="failed">Fallidos</option></select></label></div>
    <p class="admin-note">Stripe Checkout acepta tarjetas de prueba. Los comprobantes son documentos internos sin validez fiscal. Los alquileres pagados se crean en el módulo Alquileres.</p>
    <p v-if="error" class="admin-alert" role="alert">{{ error }}</p><p v-if="loading" class="admin-empty" role="status">Cargando pedidos…</p>
    <div v-else class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Pedido</th><th>Cliente</th><th>Artículos</th><th>Total</th><th>Estado</th><th>Comprobante</th></tr></thead><tbody>
      <tr v-for="order in rows" :key="order._id"><td><span class="invoice-number">{{ order._id.slice(-12).toUpperCase() }}</span><small>{{ dateTime(order.createdAt) }}</small></td><td><strong>{{ order.customer.name }}</strong><small>{{ order.customer.email }}</small></td><td>{{ order.items.length }} línea(s)<small>{{ order.items.reduce((sum,item) => sum + item.quantity, 0) }} unidad(es)</small></td><td>{{ money(order.total) }}<small>{{ order.currency.toUpperCase() }}</small></td><td><span class="admin-badge" :class="order.status === 'paid' ? 'good' : order.status === 'pending' ? 'warn' : 'danger'">{{ statusLabel[order.status] }}</span><small v-if="order.paidAt">{{ dateTime(order.paidAt) }}</small></td><td><button class="admin-sub-link" :disabled="!order.receipt" @click="selected = order">{{ order.receipt ? 'Ver / imprimir' : 'Aún sin comprobante' }}</button></td></tr>
      <tr v-if="!rows.length"><td colspan="6" class="admin-empty">No hay pedidos para estos filtros.</td></tr>
    </tbody></table></div>
    <AdminDialog v-if="selected?.receipt" title="Comprobante de pedido" printable @close="selected = null">
      <article class="invoice-document"><header><p class="admin-eyebrow">Comprobante interno · Sin validez fiscal</p><h2>{{ selected.receipt.issuer.businessName }}</h2><p>{{ selected.receipt.issuer.address }}</p><p>{{ [selected.receipt.issuer.contactEmail, selected.receipt.issuer.phone].filter(Boolean).join(' · ') }}</p></header>
        <div class="invoice-meta"><p><strong>Número</strong><span class="invoice-number">{{ selected.receipt.number }}</span></p><p><strong>Emisión</strong>{{ dateTime(selected.receipt.issuedAt) }}</p></div><section><h3>Cliente</h3><p>{{ selected.receipt.customer.name }}</p><p>{{ selected.receipt.customer.email }}</p></section><section><h3>Detalle del pedido</h3><p v-for="(item,index) in selected.receipt.items" :key="index">{{ item.kind === 'rental' ? `Alquiler · ${item.days} días` : 'Compra' }}: {{ item.title }} · Vol. {{ item.volume }} × {{ item.quantity }} — {{ money(item.lineTotal) }}</p></section><div class="invoice-total"><span>Total pagado · {{ selected.receipt.currency.toUpperCase() }}</span><strong>{{ money(selected.receipt.total) }}</strong></div><p>{{ selected.receipt.payment.provider === 'local-seed' ? 'Pedido de demostración: no se realizó ningún cobro.' : 'Pago registrado con Stripe en modo de prueba.' }}</p><p class="admin-muted">Este documento es un recibo de pedido interno y no es una factura fiscal.</p>
      </article><footer class="admin-actions no-print"><button class="admin-button secondary" @click="selected = null">Cerrar</button><button class="admin-button" @click="print">Imprimir / guardar PDF</button></footer>
    </AdminDialog>
  </div>
</template>
