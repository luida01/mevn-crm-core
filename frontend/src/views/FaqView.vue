<template>
  <div id="top" class="storefront faq-page min-h-screen">
    <ShopHeader />

    <main>
      <section class="faq-hero" aria-labelledby="faq-title">
        <div class="faq-hero__copy">
          <p class="faq-eyebrow"><span aria-hidden="true">✳</span> Centro de ayuda</p>
          <h1 id="faq-title">Respuestas para<br><em>seguir leyendo.</em></h1>
          <p class="faq-hero__intro">
            Entiende qué ofrece el catálogo y cómo funcionan las compras y alquileres en modo de prueba.
          </p>
          <a class="faq-hero__link" href="#preguntas">Ver preguntas frecuentes <span aria-hidden="true">↓</span></a>
        </div>

        <aside class="faq-shortcuts" aria-label="Accesos a información de la tienda">
          <div class="faq-shortcuts__mark" aria-hidden="true">?</div>
          <p class="faq-shortcuts__eyebrow">Información útil</p>
          <h2>¿Buscas todos los detalles?</h2>
          <p>Revisa lo que puede hacer el sistema en esta versión.</p>
          <router-link to="/rental-policies">Políticas de alquiler <span aria-hidden="true">↗</span></router-link>
          <router-link to="/return-policy">Devoluciones y reembolsos <span aria-hidden="true">↗</span></router-link>
          <router-link to="/terms">Términos y condiciones <span aria-hidden="true">↗</span></router-link>
        </aside>
      </section>

      <section id="preguntas" class="faq-main" aria-labelledby="faq-list-title">
        <div class="faq-main__heading">
          <div>
            <p class="faq-eyebrow">A un paso de tu próxima historia</p>
            <h2 id="faq-list-title">Preguntas frecuentes</h2>
          </div>
          <p>Busca un tema o abre una pregunta para ver su respuesta.</p>
        </div>

        <label class="faq-search">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" stroke-width="1.7"/><path d="m16 16 4.2 4.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          <span class="faq-search__sr-only">Buscar en preguntas frecuentes</span>
          <input v-model="searchQuery" type="search" placeholder="Prueba: alquiler, pago o devolución" autocomplete="off">
          <span v-if="searchQuery" class="faq-search__count" aria-live="polite">{{ filteredFaqs.length }} {{ filteredFaqs.length === 1 ? 'resultado' : 'resultados' }}</span>
        </label>

        <div v-if="filteredFaqs.length" class="faq-list">
          <article
            v-for="(faq, index) in filteredFaqs"
            :key="faq.id"
            class="faq-item"
            :class="{ 'faq-item--open': openFaqId === faq.id }"
          >
            <h3 class="faq-item__heading">
              <button
                :id="`faq-question-${faq.id}`"
                class="faq-question"
                type="button"
                :aria-expanded="openFaqId === faq.id"
                :aria-controls="`faq-answer-${faq.id}`"
                @click="toggleFaq(faq.id)"
              >
                <span class="faq-question__number">{{ String(index + 1).padStart(2, '0') }}</span>
                <span class="faq-question__text">{{ faq.question }}</span>
                <span class="faq-question__toggle" aria-hidden="true">{{ openFaqId === faq.id ? '−' : '+' }}</span>
              </button>
            </h3>
            <Transition name="faq-answer">
              <div
                v-if="openFaqId === faq.id"
                :id="`faq-answer-${faq.id}`"
                class="faq-answer"
                role="region"
                :aria-labelledby="`faq-question-${faq.id}`"
              >
                <p>{{ faq.answer }}</p>
                <div v-if="faq.links?.length" class="faq-answer__links">
                  <router-link v-for="link in faq.links" :key="link.to" :to="link.to">{{ link.label }} <span aria-hidden="true">↗</span></router-link>
                </div>
              </div>
            </Transition>
          </article>
        </div>

        <div v-else class="faq-empty" role="status">
          <span aria-hidden="true">⌕</span>
          <h3>No encontramos esa pregunta</h3>
          <p>Prueba con otra palabra, como «alquiler», «entrega» o «pago».</p>
          <button type="button" @click="searchQuery = ''">Borrar búsqueda</button>
        </div>
      </section>
    </main>

    <ShopFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import ShopFooter from '../components/ShopFooter.vue';
import ShopHeader from '../components/ShopHeader.vue';

const searchQuery = ref('');
const openFaqId = ref<string | null>(null);

const faqs = [
  {
    id: 'comprar-alquilar',
    question: '¿Puedo comprar o alquilar desde la tienda?',
    answer: 'Puedes combinar compras y alquileres en un mismo carrito y continuar a Stripe Checkout en modo de prueba. Al iniciar el pago, el sistema reserva stock temporalmente; una operación aprobada queda en Pedidos y los alquileres aparecen en el panel.',
    links: [{ label: 'Estado de los alquileres', to: '/rental-policies' }]
  },
  {
    id: 'precios',
    question: '¿Qué significa el precio de alquiler?',
    answer: 'El catálogo muestra la tarifa diaria configurada para cada volumen. El panel interno calcula el costo de un alquiler según los días registrados; desde esta tienda todavía no se puede iniciar ese proceso.',
    links: [{ label: 'Cómo funciona el alquiler', to: '/rental-policies' }]
  },
  {
    id: 'stock',
    question: '¿Cómo consulto si hay ejemplares disponibles?',
    answer: 'Abre la ficha de un manga desde una tarjeta del catálogo para ver el stock que figura actualmente en el sistema. Esa cantidad es informativa y no reserva un ejemplar.',
    links: []
  },
  {
    id: 'devoluciones',
    question: '¿Cómo se registra una devolución?',
    answer: 'Actualmente el equipo marca la devolución desde el panel administrativo. El sitio público no programa recogidas ni ofrece un historial personal de alquileres.',
    links: [{ label: 'Estado de las devoluciones', to: '/return-policy' }]
  },
  {
    id: 'condiciones',
    question: '¿Cuáles son los plazos y cargos de alquiler?',
    answer: 'Los períodos fijos, depósitos, recargos por retraso, descuentos y condiciones de entrega todavía no están confirmados en esta versión. No se anuncian como condiciones del servicio hasta que el negocio los defina.',
    links: [{ label: 'Ver información del sistema', to: '/rental-policies' }]
  },
  {
    id: 'pagos',
    question: '¿Qué medios de pago puedo usar?',
    answer: 'La tienda usa Stripe Checkout en modo de prueba. Se necesita configurar las claves de prueba en el servidor y no se procesan cobros reales.',
    links: [{ label: 'Leer términos del proyecto', to: '/terms' }]
  },
  {
    id: 'politicas',
    question: '¿Dónde encuentro todas las condiciones?',
    answer: 'Aquí tienes las páginas con el detalle de cada servicio. Si una condición no está clara, revisa la información correspondiente al producto antes de continuar.',
    links: [
      { label: 'Alquileres', to: '/rental-policies' },
      { label: 'Devoluciones', to: '/return-policy' },
      { label: 'Términos', to: '/terms' }
    ]
  }
];

const filteredFaqs = computed(() => {
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  const query = normalize(searchQuery.value.trim());
  if (!query) return faqs;
  return faqs.filter((faq) => normalize(`${faq.question} ${faq.answer}`).includes(query));
});

const toggleFaq = (id: string) => {
  openFaqId.value = openFaqId.value === id ? null : id;
};
</script>

<style scoped>
.faq-page {
  --faq-content-width: 1080px;
}

.faq-hero {
  position: relative;
  display: grid;
  max-width: var(--faq-content-width);
  min-height: 420px;
  grid-template-columns: minmax(0, 1.3fr) minmax(290px, 0.7fr);
  align-items: center;
  gap: clamp(36px, 8vw, 110px);
  margin-inline: auto;
  padding: 68px 32px 78px;
}

.faq-hero::before {
  position: absolute;
  z-index: 0;
  top: 36px;
  left: -150px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(229, 182, 81, 0.23), rgba(229, 182, 81, 0) 70%);
  content: '';
  pointer-events: none;
}

.faq-hero__copy,
.faq-shortcuts {
  position: relative;
  z-index: 1;
}

.faq-eyebrow {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 15px;
  color: var(--shop-green);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.faq-eyebrow span {
  color: var(--shop-accent);
  font-size: 1.2rem;
}

.faq-hero h1 {
  margin: 0;
  color: var(--shop-ink);
  font-size: clamp(3.15rem, 6vw, 5.1rem);
  font-weight: 800;
  line-height: 0.98;
}

.faq-hero h1 em {
  color: var(--shop-accent);
  font-weight: 600;
}

.faq-hero__intro {
  max-width: 490px;
  margin: 22px 0 20px;
  color: #686a61;
  font-size: 1.03rem;
  line-height: 1.75;
}

.faq-hero__link {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  color: var(--shop-ink);
  font-size: 0.9rem;
  font-weight: 750;
  text-decoration: none;
}

.faq-hero__link span {
  color: var(--shop-accent);
  font-size: 1.2rem;
  transition: transform 160ms ease;
}

.faq-hero__link:hover span { transform: translateY(3px); }

.faq-shortcuts {
  overflow: hidden;
  border: 1px solid rgba(229, 218, 199, 0.82);
  border-radius: 24px;
  background: rgba(255, 253, 248, 0.86);
  padding: 26px 27px 20px;
  box-shadow: 0 18px 45px rgba(74, 57, 37, 0.07);
}

.faq-shortcuts__mark {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 14px;
  background: #f1e3c6;
  color: var(--shop-accent);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.55rem;
  font-weight: 700;
}

.faq-shortcuts__eyebrow {
  margin: 19px 0 6px;
  color: var(--shop-muted);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.faq-shortcuts h2 {
  margin: 0;
  color: var(--shop-ink);
  font-size: 1.55rem;
  line-height: 1.16;
}

.faq-shortcuts > p:not(.faq-shortcuts__eyebrow) {
  margin: 10px 0 13px;
  color: var(--shop-muted);
  font-size: 0.88rem;
  line-height: 1.6;
}

.faq-shortcuts a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid var(--shop-line);
  padding: 12px 0;
  color: var(--shop-ink);
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
  transition: color 150ms ease;
}

.faq-shortcuts a:hover,
.faq-answer__links a:hover { color: var(--shop-accent); }

.faq-shortcuts a span,
.faq-answer__links a span {
  color: var(--shop-accent);
}

.faq-main {
  max-width: 850px;
  margin: 0 auto;
  padding: 30px 32px 104px;
  scroll-margin-top: 100px;
}

.faq-main__heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 28px;
  margin-bottom: 25px;
}

.faq-main__heading .faq-eyebrow { margin-bottom: 8px; }

.faq-main__heading h2 {
  margin: 0;
  color: var(--shop-ink);
  font-size: clamp(2rem, 4vw, 2.75rem);
  line-height: 1.08;
}

.faq-main__heading > p {
  max-width: 250px;
  margin: 0 0 3px;
  color: var(--shop-muted);
  font-size: 0.88rem;
  line-height: 1.6;
}

.faq-search {
  display: flex;
  min-height: 58px;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--shop-line);
  border-radius: 16px;
  background: var(--shop-surface);
  padding: 0 17px;
  box-shadow: 0 7px 22px rgba(74, 57, 37, 0.04);
}

.faq-search > svg {
  width: 21px;
  flex: 0 0 auto;
  color: var(--shop-green);
}

.faq-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--shop-ink);
  font: inherit;
  font-size: 0.91rem;
}

.faq-search input::placeholder { color: #99968d; }
.faq-search input:focus-visible { outline: 0; }

.faq-search__sr-only {
  position: absolute;
  overflow: hidden;
  width: 1px;
  height: 1px;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.faq-search__count {
  flex: 0 0 auto;
  color: var(--shop-muted);
  font-size: 0.75rem;
}

.faq-list {
  display: grid;
  gap: 11px;
  margin-top: 18px;
}

.faq-item {
  overflow: hidden;
  border: 1px solid var(--shop-line);
  border-radius: 17px;
  background: var(--shop-surface);
  transition: border-color 170ms ease, box-shadow 170ms ease;
}

.faq-item--open {
  border-color: rgba(195, 75, 49, 0.46);
  box-shadow: 0 10px 24px rgba(74, 57, 37, 0.06);
}

.faq-item__heading { margin: 0; }

.faq-question {
  display: grid;
  width: 100%;
  min-height: 76px;
  grid-template-columns: 42px minmax(0, 1fr) 38px;
  align-items: center;
  gap: 13px;
  border: 0;
  background: transparent;
  padding: 13px 20px;
  color: var(--shop-ink);
  cursor: pointer;
  text-align: left;
}

.faq-question__number {
  color: #a39b8d;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.92rem;
}

.faq-question__text {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.35;
}

.faq-question__toggle {
  display: grid;
  width: 35px;
  height: 35px;
  place-items: center;
  border-radius: 50%;
  background: #f3ecdf;
  color: var(--shop-green);
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 1.35rem;
  font-weight: 400;
  transition: color 160ms ease, background 160ms ease, transform 160ms ease;
}

.faq-item--open .faq-question__toggle {
  background: var(--shop-accent);
  color: #fffdf8;
  transform: rotate(180deg);
}

.faq-answer {
  border-top: 1px solid rgba(229, 218, 199, 0.7);
  margin: 0 20px 0 75px;
  padding: 16px 8px 21px 0;
}

.faq-answer p {
  margin: 0;
  color: #686a61;
  font-size: 0.91rem;
  line-height: 1.8;
}

.faq-answer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 9px 19px;
  margin-top: 13px;
}

.faq-answer__links a {
  color: var(--shop-green);
  font-size: 0.8rem;
  font-weight: 750;
  text-decoration: none;
  transition: color 150ms ease;
}

.faq-empty {
  margin-top: 18px;
  border: 1px dashed #cabda8;
  border-radius: 18px;
  padding: 34px 20px;
  color: var(--shop-muted);
  text-align: center;
}

.faq-empty > span { color: var(--shop-accent); font-size: 2rem; }
.faq-empty h3 { margin: 8px 0; color: var(--shop-ink); font-size: 1.3rem; }
.faq-empty p { margin: 0 auto 16px; font-size: 0.88rem; }
.faq-empty button { border: 0; background: none; color: var(--shop-green); cursor: pointer; font: inherit; font-size: 0.86rem; font-weight: 750; }

.faq-answer-enter-active,
.faq-answer-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.faq-answer-enter-from,
.faq-answer-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@media (max-width: 720px) {
  .faq-hero {
    min-height: initial;
    grid-template-columns: 1fr;
    gap: 34px;
    padding: 52px 24px 42px;
  }

  .faq-hero::before { left: -220px; }
  .faq-shortcuts { max-width: 470px; }
  .faq-main { padding: 30px 24px 76px; }
  .faq-main__heading { align-items: start; flex-direction: column; gap: 10px; }
  .faq-main__heading > p { max-width: 420px; }
}

@media (max-width: 480px) {
  .faq-hero { padding-inline: 20px; }
  .faq-hero h1 { font-size: clamp(2.7rem, 13vw, 3.5rem); }
  .faq-main { padding-inline: 18px; }
  .faq-search { gap: 9px; padding-inline: 13px; }
  .faq-search input { font-size: 0.83rem; }
  .faq-search__count { font-size: 0.68rem; }
  .faq-question { min-height: 70px; grid-template-columns: 25px minmax(0, 1fr) 34px; gap: 10px; padding: 12px; }
  .faq-question__text { font-size: 0.96rem; }
  .faq-question__toggle { width: 32px; height: 32px; }
  .faq-answer { margin-left: 47px; margin-right: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  .faq-page *,
  .faq-page *::before,
  .faq-page *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
