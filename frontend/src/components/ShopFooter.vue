<template>
  <footer class="shop-footer">
    <div class="shop-footer__inner">
      <div class="shop-footer__grid">
        <div class="shop-footer__brand">
          <router-link to="/" class="shop-footer__wordmark" aria-label="MangaGo, inicio">MangaGo<span>•</span></router-link>
          <p>Un lugar para descubrir historias, probar nuevas series y encontrar tu próxima favorita.</p>
          <router-link to="/faq" class="shop-footer__help">¿Necesitas ayuda? <span aria-hidden="true">↗</span></router-link>
        </div>

        <nav class="shop-footer__column" aria-label="Explorar tienda">
          <h3>Explora</h3>
          <a href="/#novedades">Novedades</a>
          <a href="/#tendencias">Favoritos de lectores</a>
          <a href="/#colecciones">Colecciones</a>
        </nav>

        <nav class="shop-footer__column" aria-label="Información">
          <h3>Información</h3>
          <router-link to="/faq">Preguntas frecuentes</router-link>
          <router-link to="/rental-policies">Políticas de alquiler</router-link>
          <router-link to="/return-policy">Política de devolución</router-link>
          <router-link to="/terms">Términos y condiciones</router-link>
        </nav>

        <div class="shop-footer__note">
          <span aria-hidden="true">読</span>
          <p>Una página a la vez.<br>Un mundo nuevo en cada historia.</p>
        </div>
      </div>

      <div class="shop-footer__bottom">
        <p>© {{ currentYear }} MangaGo</p>
        <a href="#top" aria-label="Volver al inicio">Volver arriba ↑</a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<style scoped>
.shop-footer {
  background: #252720;
  color: #fffdf8;
}

.shop-footer__inner {
  max-width: 1280px;
  margin-inline: auto;
  padding: 56px 32px 24px;
}

.shop-footer__grid {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr 1fr 0.9fr;
  gap: 42px;
  padding-bottom: 46px;
}

.shop-footer__brand { max-width: 310px; }

.shop-footer__wordmark {
  color: #fffdf8;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: -0.06em;
  text-decoration: none;
}

.shop-footer__wordmark span {
  margin-left: 3px;
  color: #e5b651;
}

.shop-footer__brand p,
.shop-footer__note p {
  color: rgba(255, 253, 248, 0.66);
  font-size: 0.85rem;
  line-height: 1.7;
}

.shop-footer__help {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 7px;
  color: #e5b651;
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
}

.shop-footer__column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.shop-footer__column h3 {
  margin: 4px 0 5px;
  color: #fffdf8;
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 0.86rem;
  font-weight: 800;
}

.shop-footer__column a,
.shop-footer__bottom a {
  color: rgba(255, 253, 248, 0.67);
  font-size: 0.8rem;
  text-decoration: none;
  transition: color 150ms ease;
}

.shop-footer__column a:hover,
.shop-footer__bottom a:hover { color: #e5b651; }

.shop-footer__note {
  align-self: center;
  border-left: 1px solid rgba(255, 253, 248, 0.2);
  padding-left: 25px;
}

.shop-footer__note > span {
  color: #e5b651;
  font-size: 1.55rem;
}

.shop-footer__note p { margin-bottom: 0; }

.shop-footer__bottom {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  border-top: 1px solid rgba(255, 253, 248, 0.14);
  padding-top: 18px;
}

.shop-footer__bottom p {
  margin: 0;
  color: rgba(255, 253, 248, 0.53);
  font-size: 0.75rem;
}

@media (max-width: 800px) {
  .shop-footer__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 30px; }
}

@media (max-width: 520px) {
  .shop-footer__inner { padding: 42px 20px 22px; }
  .shop-footer__grid { grid-template-columns: 1fr 1fr; gap: 28px 18px; }
  .shop-footer__brand { grid-column: 1 / -1; }
  .shop-footer__note { display: none; }
  .shop-footer__bottom { align-items: center; }
}
</style>
