<script setup lang="ts">
import { ref } from 'vue';
import CustomerList from '../components/CustomerList.vue';
import CustomerForm from '../components/CustomerForm.vue';
import { useCustomerStore } from '../stores/customerStore';
import type { Customer } from '../types/Customer';
const store = useCustomerStore();
const showForm = ref(false);
const editing = ref<Customer | null>(null);
const open = (customer: Customer | null = null) => { editing.value = customer; showForm.value = true; };
</script>
<template>
  <div class="admin-page">
    <header class="admin-page-header"><div><p class="admin-eyebrow">Relaciones</p><h1>Clientes</h1><p>Datos de contacto, cuentas activas e historial de alquileres.</p></div><button class="admin-button" @click="open()">+ Nuevo cliente</button></header>
    <div class="admin-toolbar"><label class="admin-search"><span class="sr-only">Buscar cliente</span><input v-model="store.searchQuery" type="search" placeholder="Nombre, correo o teléfono"></label><label><span class="sr-only">Estado del cliente</span><select v-model="store.statusFilter"><option value="all">Todos los clientes</option><option value="renting">Con alquileres</option><option value="overdue">Con vencidos</option><option value="not-renting">Sin alquileres activos</option><option value="inactive">Cuentas inactivas</option></select></label><button class="admin-button secondary" :disabled="store.loading" @click="store.fetchCustomers()">Actualizar</button></div>
    <CustomerList @edit="open" />
    <CustomerForm v-if="showForm" :customer-to-edit="editing" @close="showForm = false" />
  </div>
</template>
