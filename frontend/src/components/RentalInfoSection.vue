<template>
  <div class="rental-panel">
    <div class="rental-panel__heading">
      <p class="section-eyebrow">Fácil, flexible y a tu ritmo</p>
      <h2>Alquila para probar. Compra para quedarte.</h2>
    </div>
    
    <div class="rental-grid">
      <!-- Benefits of Rental -->
      <div class="rental-card rental-card--green">
        <div class="rental-card__icon">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3>Prueba algo nuevo</h3>
        <ul class="rental-card__details">
          <li>✓ Elige un volumen disponible</li>
          <li>✓ Paga solo por los días de alquiler</li>
          <li>✓ Descubre nuevas series</li>
          <li>✓ Sin comprometerte a comprar</li>
        </ul>
      </div>

      <!-- Pricing -->
      <div class="rental-card rental-card--gold">
        <div class="rental-card__icon">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
          </svg>
        </div>
        <h3>Precios claros</h3>
        <ul class="rental-card__details">
          <li>📖 Consulta el precio de cada volumen</li>
          <li>📚 Compara alquiler y compra</li>
          <li>🎁 Elige lo que te convenga</li>
          <li>⭐ Sin cargos sorpresa</li>
        </ul>
      </div>

      <!-- Return Process -->
      <div class="rental-card rental-card--clay">
        <div class="rental-card__icon">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
          </svg>
        </div>
        <h3>Devuelve fácilmente</h3>
        <ul class="rental-card__details">
          <li>1. Avísanos que harás la devolución</li>
          <li>2. Prepara el volumen</li>
          <li>3. Entrégalo en la tienda</li>
          <li>4. Recibe confirmación</li>
        </ul>
      </div>

      <!-- Rental vs Purchase -->
      <div class="rental-card rental-card--ink">
        <div class="rental-card__icon">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3>Hazlo parte de tu colección</h3>
        <ul class="rental-card__details">
          <li>📚 Compra tu volumen favorito</li>
          <li>💛 Conserva tus historias preferidas</li>
          <li>🎁 Un gran regalo para otro lector</li>
          <li>🏠 Siempre en tu estantería</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props or state needed for this static component
</script>

<style scoped>
.rental-panel {
  border: 1px solid var(--shop-line);
  border-radius: 24px;
  background: var(--shop-surface);
  padding: clamp(22px, 4vw, 42px);
  box-shadow: 0 12px 30px rgba(49, 39, 27, 0.06);
}

.rental-panel__heading {
  margin-bottom: 28px;
  text-align: center;
}

.rental-panel__heading .section-eyebrow { justify-content: center; }

.rental-panel__heading h2 {
  max-width: 700px;
  margin: 0 auto;
  color: var(--shop-ink);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.8rem, 3.5vw, 2.65rem);
  font-weight: 700;
  line-height: 1.12;
}

.rental-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.rental-card {
  border: 1px solid transparent;
  border-radius: 17px;
  padding: 20px 17px;
}

.rental-card--green { border-color: #d6e2d4; background: #eff3ec; }
.rental-card--gold { border-color: #eadfbf; background: #f8f1dd; }
.rental-card--clay { border-color: #ebd7ca; background: #f8ece4; }
.rental-card--ink { border-color: #d9dcd4; background: #eef0ea; }

.rental-card__icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  margin: 0 auto 15px;
  border-radius: 15px;
  background: var(--shop-green);
  color: white;
}

.rental-card--gold .rental-card__icon { background: #a77b28; }
.rental-card--clay .rental-card__icon { background: var(--shop-accent); }
.rental-card--ink .rental-card__icon { background: var(--shop-ink); }

.rental-card__icon svg { width: 23px; height: 23px; }

.rental-card h3 {
  min-height: 2.4em;
  margin: 0 0 13px;
  color: var(--shop-ink);
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 0.98rem;
  font-weight: 750;
  line-height: 1.25;
  text-align: center;
}

.rental-card__details {
  display: grid;
  gap: 9px;
  margin: 0;
  padding: 0;
  color: #676a61;
  font-size: 0.77rem;
  line-height: 1.45;
  list-style: none;
}

@media (max-width: 900px) {
  .rental-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 520px) {
  .rental-grid { grid-template-columns: 1fr; }
}
</style>
