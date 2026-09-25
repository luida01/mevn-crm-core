<script setup lang="ts">
import { ref } from 'vue';
import AdminDialog from './AdminDialog.vue';
import { useRentalStore } from '../stores/rentalStore';
import { money, customerName } from '../services/format';
import type { Rental } from '../types/Rental';
const props = defineProps<{ rental: Rental; paymentOnly?: boolean }>();
const store = useRentalStore();
const action = ref<'return' | 'payment' | null>(null);
const confirmAction = async () => {
  const success = action.value === 'return'
    ? await store.returnRental(props.rental._id)
    : await store.setPayment(props.rental._id, !props.rental.isPaid);
  if (success) action.value = null;
};
</script>
<template>
  <div class="admin-actions">
    <button v-if="!paymentOnly && rental.status !== 'RETURNED'" class="admin-text-button" :disabled="!!store.busy" @click="store.error = null; action = 'return'">Registrar devolución</button>
    <button class="admin-text-button" :disabled="!!store.busy" @click="store.error = null; action = 'payment'">{{ rental.isPaid ? 'Corregir pago' : 'Registrar pago' }}</button>
  </div>
  <AdminDialog v-if="action" :title="action === 'return' ? 'Registrar devolución' : rental.isPaid ? 'Corregir pago' : 'Registrar pago recibido'" :busy="!!store.busy" @close="action = null">
    <div class="admin-form">
      <p><strong>{{ customerName(rental) }}</strong><br>{{ rental.manga?.title }} · Vol. {{ rental.manga?.volume }}</p>
      <p v-if="action === 'return'" class="admin-note">La devolución repondrá una unidad en inventario. El estado del pago se conserva.</p>
      <p v-else class="admin-note">{{ rental.isPaid ? 'El importe volverá a quedar pendiente de cobro.' : 'Confirma que el negocio recibió este importe.' }} <strong>{{ money(rental.cost) }}</strong></p>
      <p v-if="store.error" class="admin-alert" role="alert">{{ store.error }}</p>
      <footer class="admin-actions"><button class="admin-button secondary" :disabled="!!store.busy" @click="action = null">Cancelar</button><button class="admin-button" :disabled="!!store.busy" @click="confirmAction">{{ store.busy ? 'Guardando…' : 'Confirmar' }}</button></footer>
    </div>
  </AdminDialog>
</template>
