<template>
  <InfoPageLayout
    eyebrow="Alquileres"
    title="Cómo funciona hoy"
    description="Una guía clara sobre la información que ofrece el catálogo y lo que el sistema puede gestionar en esta versión."
    notice="Las condiciones comerciales finales —duración, depósito, cargos por retraso, entregas y pagos— todavía deben ser confirmadas por el negocio. Esta página describe solo el comportamiento que existe en la aplicación."
  >
    <section class="info-card">
      <p class="info-card__eyebrow">LO QUE PUEDES CONSULTAR</p>
      <h2>Precios y disponibilidad por volumen</h2>
      <p>La tienda muestra los títulos del catálogo, el volumen, el precio de compra, la tarifa de alquiler por día y las unidades registradas en inventario.</p>
    </section>

    <section class="info-card">
      <p class="info-card__eyebrow">GESTIÓN INTERNA</p>
      <h2>Registro de alquileres</h2>
      <p>El panel permite al equipo crear un alquiler para un cliente y un manga con stock disponible, fijar una fecha de devolución y consultar el estado del alquiler.</p>
      <div class="info-card__grid">
        <article class="info-detail"><span aria-hidden="true">01</span><h3>Stock</h3><p>Al registrar un alquiler, se reserva una unidad. Al marcar la devolución, esa unidad vuelve al inventario.</p></article>
        <article class="info-detail"><span aria-hidden="true">02</span><h3>Cálculo</h3><p>El sistema calcula el costo usando la tarifa diaria configurada para el manga y los días hasta la fecha de devolución.</p></article>
        <article class="info-detail"><span aria-hidden="true">03</span><h3>Pago</h3><p>El panel guarda si el alquiler figura como pagado. La simulación visible en la tienda no procesa pagos reales.</p></article>
      </div>
    </section>

    <section class="info-card info-card--tinted">
      <p class="info-card__eyebrow">PENDIENTE DE DEFINIR</p>
      <h2>Condiciones comerciales</h2>
      <p>La versión actual no configura periodos fijos, extensiones, depósitos, descuentos, multas, cobertura de entrega ni medios de pago. Esos valores deben definirse antes de anunciarlos como condiciones del servicio.</p>
    </section>

    <nav class="info-related" aria-label="Más información">
      <router-link to="/faq">Preguntas frecuentes <span aria-hidden="true">↗</span></router-link>
      <router-link to="/return-policy">Devoluciones <span aria-hidden="true">↗</span></router-link>
      <router-link to="/terms">Términos y condiciones <span aria-hidden="true">↗</span></router-link>
    </nav>
  </InfoPageLayout>
</template>

<script setup lang="ts">
import InfoPageLayout from '../components/InfoPageLayout.vue';
</script>
