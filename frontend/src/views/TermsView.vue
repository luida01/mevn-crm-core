<template>
  <InfoPageLayout
    eyebrow="Información legal"
    title="Términos y condiciones"
    description="Resumen del alcance de esta versión de MangaGo y de la información que aún falta aprobar."
    notice="Este contenido es un borrador de interfaz, no un documento jurídico revisado. Antes de publicarlo como términos oficiales, el negocio debe validar su identidad legal, jurisdicción, privacidad, propiedad intelectual, medios de pago y condiciones comerciales."
  >
    <section class="info-card">
      <p class="info-card__eyebrow">01 · ALCANCE</p>
      <h2>Catálogo público</h2>
      <p>La web permite explorar títulos y consultar el catálogo. El carrito puede combinar compras y alquileres y abrir Stripe Checkout en modo de prueba. Este entorno no procesa pagos reales.</p>
    </section>

    <section class="info-card">
      <p class="info-card__eyebrow">02 · DISPONIBILIDAD Y PRECIOS</p>
      <h2>Información administrada por el equipo</h2>
      <p>Los precios y las cantidades disponibles provienen del inventario administrado en el sistema. Al iniciar un checkout de prueba, la tienda reserva temporalmente las unidades; las sesiones canceladas o vencidas liberan esa reserva.</p>
    </section>

    <section class="info-card">
      <p class="info-card__eyebrow">03 · ALQUILERES Y DEVOLUCIONES</p>
      <h2>Operaciones en preparación</h2>
      <p>El panel interno permite gestionar alquileres, devoluciones y pedidos de prueba. Un pago aprobado en Stripe de prueba genera un pedido y un comprobante interno; las líneas de alquiler también crean sus registros para administrar la devolución. Las reglas comerciales finales deben confirmarse antes de habilitar pagos reales.</p>
      <div class="info-related info-related--inline">
        <router-link to="/rental-policies">Estado de los alquileres <span aria-hidden="true">↗</span></router-link>
        <router-link to="/return-policy">Estado de las devoluciones <span aria-hidden="true">↗</span></router-link>
      </div>
    </section>

    <section class="info-card info-card--tinted">
      <p class="info-card__eyebrow">04 · DATOS Y DERECHOS</p>
      <h2>Información pendiente de completar</h2>
      <p>Antes de usar esta página como acuerdo con clientes, se debe publicar la política de privacidad, explicar el tratamiento y la conservación de datos, identificar a la entidad responsable y confirmar los derechos sobre el contenido del catálogo.</p>
    </section>

    <p class="info-page__updated">Borrador de proyecto · 25 de septiembre de 2026</p>
  </InfoPageLayout>
</template>

<script setup lang="ts">
import InfoPageLayout from '../components/InfoPageLayout.vue';
</script>
