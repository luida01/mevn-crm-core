<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useCustomerStore } from '../stores/customerStore';
import type { Customer } from '../types/Customer';
const emit = defineEmits<{ edit: [customer: Customer] }>();
const store = useCustomerStore();
const pendingDelete = ref('');
const remove = async () => { if (await store.deleteCustomer(pendingDelete.value)) pendingDelete.value = ''; };
const activeCount = (customer: Customer) => customer.rentals?.filter(r => r.status !== 'RETURNED').length || 0;
const lateCount = (customer: Customer) => customer.rentals?.filter(r => r.status !== 'RETURNED' && new Date(r.dueDate).getTime() < Date.now()).length || 0;
onMounted(() => store.fetchCustomers());
</script>
<template>
  <p v-if="store.error" class="admin-alert" role="alert">{{ store.error }}</p>
  <p v-if="store.loading" class="admin-empty" role="status">Cargando clientes…</p>
  <div v-else class="admin-table-wrap">
    <table class="admin-table"><thead><tr><th>Cliente</th><th>Contacto</th><th>Alquileres</th><th>Cuenta</th><th>Acciones</th></tr></thead>
      <tbody><tr v-for="customer in store.filteredCustomers" :key="customer._id">
        <td><strong>{{ customer.firstName }} {{ customer.lastName }}</strong><small>{{ customer.address?.city }}</small></td>
        <td>{{ customer.email }}<small>{{ customer.phone || 'Sin teléfono' }}</small></td>
        <td><router-link :to="{ path: '/rentals', query: { customer: customer._id } }">{{ activeCount(customer) }} en curso · {{ customer.rentals?.length || 0 }} total</router-link><small v-if="lateCount(customer)" class="admin-danger">{{ lateCount(customer) }} vencidos</small></td>
        <td><span class="admin-badge" :class="customer.isActive ? 'good' : ''">{{ customer.isActive ? 'Activo' : 'Inactivo' }}</span></td>
        <td><div class="admin-actions">
          <button class="admin-text-button" @click="emit('edit', customer)">Editar</button>
          <template v-if="pendingDelete === customer._id"><span>¿Eliminar?</span><button class="admin-text-button danger" :disabled="store.saving" @click="remove">Confirmar</button><button class="admin-text-button" :disabled="store.saving" @click="pendingDelete = ''">Cancelar</button></template>
          <button v-else class="admin-text-button danger" :disabled="store.saving" @click="pendingDelete = customer._id">Eliminar</button>
        </div></td>
      </tr><tr v-if="!store.filteredCustomers.length"><td colspan="5" class="admin-empty">No hay clientes para estos filtros.</td></tr></tbody>
    </table>
  </div>
</template>
