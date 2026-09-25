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
      <p>La web permite explorar títulos y consultar los datos del catálogo. En esta versión, el sitio público no crea cuentas de clientes ni completa pedidos, alquileres o pagos reales. El flujo de pago visible es solo una simulación.</p>
    </section>

    <section class="info-card">
      <p class="info-card__eyebrow">02 · DISPONIBILIDAD Y PRECIOS</p>
      <h2>Información administrada por el equipo</h2>
      <p>Los precios y las cantidades disponibles provienen del inventario administrado en el sistema. Pueden cambiar cuando el equipo actualiza los registros; la ficha de un título no constituye una compra ni una reserva.</p>
    </section>

    <section class="info-card">
      <p class="info-card__eyebrow">03 · ALQUILERES Y DEVOLUCIONES</p>
      <h2>Operaciones en preparación</h2>
      <p>El panel interno permite gestionar registros de alquiler y devoluciones. La tienda pública ofrece una simulación de compra, alquiler y pago, pero no crea pedidos ni registra transacciones. Las reglas comerciales finales deben confirmarse antes de habilitar esos servicios.</p>
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
