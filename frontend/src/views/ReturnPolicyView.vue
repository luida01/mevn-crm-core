<template>
  <InfoPageLayout
    eyebrow="Devoluciones"
    title="Devoluciones, sin letra pequeña"
    description="Consulta lo que el sistema puede registrar ahora y qué condiciones todavía no se han definido."
    notice="La tienda pública no ofrece todavía una solicitud de devolución, cambio o reembolso. No hay plazos, métodos de recogida ni importes de compensación confirmados para publicar."
  >
    <section class="info-card">
      <p class="info-card__eyebrow">ALQUILERES</p>
      <h2>Registro de una devolución</h2>
      <p>El equipo puede marcar un alquiler como devuelto desde el panel administrativo. Al registrar la devolución, el sistema guarda la fecha y devuelve una unidad al inventario.</p>
      <div class="info-callout"><strong>La gestión es interna por ahora.</strong><span>El sitio todavía no permite programar una recogida ni consultar un historial personal de devoluciones.</span></div>
    </section>

    <section class="info-card">
      <p class="info-card__eyebrow">COMPRAS Y REEMBOLSOS</p>
      <h2>Estas operaciones aún no están habilitadas</h2>
      <p>El catálogo muestra precios, pero no procesa compras ni pagos. Por eso, la aplicación todavía no puede solicitar ni tramitar reembolsos, cambios de volumen o cancelaciones de pedidos.</p>
    </section>

    <section class="info-card info-card--tinted">
      <p class="info-card__eyebrow">ANTES DE ACTIVAR EL SERVICIO</p>
      <h2>Faltan condiciones aprobadas</h2>
      <p>Plazos, estado aceptable de los ejemplares, gastos por daños, métodos de entrega y tiempos de reembolso deben acordarse y añadirse aquí antes de ofrecerlos a clientes.</p>
    </section>

    <nav class="info-related" aria-label="Más información">
      <router-link to="/rental-policies">Políticas de alquiler <span aria-hidden="true">↗</span></router-link>
      <router-link to="/faq">Preguntas frecuentes <span aria-hidden="true">↗</span></router-link>
      <router-link to="/terms">Términos y condiciones <span aria-hidden="true">↗</span></router-link>
    </nav>
  </InfoPageLayout>
</template>

<script setup lang="ts">
import InfoPageLayout from '../components/InfoPageLayout.vue';
</script>
