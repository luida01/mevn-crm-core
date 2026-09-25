<script setup lang="ts">
import { ref } from 'vue';
import AdminDialog from './AdminDialog.vue';
import { useCustomerStore } from '../stores/customerStore';
import type { CustomerInput, Customer } from '../types/Customer';
const props = defineProps<{ customerToEdit?: Customer | null }>();
const emit = defineEmits<{ close: [] }>();
const store = useCustomerStore();
store.error = null;
const customer = props.customerToEdit;
const form = ref<CustomerInput>({
  firstName: customer?.firstName || '', lastName: customer?.lastName || '', email: customer?.email || '',
  phone: customer?.phone || '', isActive: customer?.isActive ?? true,
  address: { street: customer?.address?.street || '', city: customer?.address?.city || '', zip: customer?.address?.zip || '' }
});
const submit = async () => { if (await store.saveCustomer(form.value, customer?._id)) emit('close'); };
</script>
<template>
  <AdminDialog :title="customerToEdit ? 'Editar cliente' : 'Nuevo cliente'" :busy="store.saving" @close="emit('close')">
    <p v-if="store.error" class="admin-alert" role="alert">{{ store.error }}</p>
    <form class="admin-form" @submit.prevent="submit">
      <div class="admin-form-grid">
        <label>Nombre<input v-model.trim="form.firstName" required maxlength="100" autocomplete="given-name"></label>
        <label>Apellido<input v-model.trim="form.lastName" required maxlength="100" autocomplete="family-name"></label>
        <label>Correo<input v-model.trim="form.email" required type="email" maxlength="254" autocomplete="email"></label>
        <label>Teléfono<input v-model.trim="form.phone" type="tel" maxlength="40" autocomplete="tel"></label>
        <label class="span-2">Dirección<input v-model.trim="form.address.street" maxlength="300" autocomplete="street-address"></label>
        <label>Ciudad<input v-model.trim="form.address.city" maxlength="100" autocomplete="address-level2"></label>
        <label>Código postal<input v-model.trim="form.address.zip" maxlength="20" autocomplete="postal-code"></label>
      </div>
      <label class="admin-checkbox"><input v-model="form.isActive" type="checkbox"> Cliente activo</label>
      <p class="admin-muted">Un cliente inactivo conserva su historial y no puede iniciar nuevos alquileres.</p>
      <footer class="admin-actions"><button type="button" class="admin-button secondary" :disabled="store.saving" @click="emit('close')">Cancelar</button><button class="admin-button" :disabled="store.saving">{{ store.saving ? 'Guardando…' : 'Guardar cliente' }}</button></footer>
    </form>
  </AdminDialog>
</template>
