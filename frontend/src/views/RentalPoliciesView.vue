<template>
  <InfoPageLayout
    :eyebrow="t('policy.rentalEyebrow')"
    :title="t('policy.rentalTitle')"
    :description="t('policy.rentalDescription')"
    :notice="t('policy.rentalNotice')"
  >
    <section class="info-card">
      <p class="info-card__eyebrow">{{ t('policy.catalog') }}</p>
      <h2>{{ t('policy.volumePrice') }}</h2>
      <p>{{ t('policy.volumeDescription') }}</p>
    </section>

    <section class="info-card">
      <p class="info-card__eyebrow">{{ t('policy.internal') }}</p>
      <h2>{{ t('policy.rentalRecords') }}</h2>
      <p>{{ t('policy.rentalManagement') }}</p>
      <div class="info-card__grid">
        <article class="info-detail"><span aria-hidden="true">01</span><h3>{{ t('policy.stock') }}</h3><p>{{ t('policy.stockDescription') }}</p></article>
        <article class="info-detail"><span aria-hidden="true">02</span><h3>{{ t('policy.calculation') }}</h3><p>{{ t('policy.calculationDescription') }}</p></article>
        <article class="info-detail"><span aria-hidden="true">03</span><h3>{{ t('policy.payment') }}</h3><p>{{ t('policy.paymentDescription') }}</p></article>
      </div>
    </section>

    <section class="info-card info-card--tinted">
      <p class="info-card__eyebrow">{{ t('policy.pending') }}</p>
      <h2>{{ t('policy.conditions') }}</h2>
      <p>{{ t('policy.conditionsDescription') }}</p>
    </section>

    <nav class="info-related" :aria-label="t('policy.moreInfo')">
      <router-link to="/faq">{{ t('footer.faq') }} <span aria-hidden="true">↗</span></router-link>
      <router-link to="/return-policy">{{ t('policy.returnStatus') }} <span aria-hidden="true">↗</span></router-link>
      <router-link to="/terms">{{ t('faq.terms') }} <span aria-hidden="true">↗</span></router-link>
    </nav>
  </InfoPageLayout>
</template>

<script setup lang="ts">
import InfoPageLayout from '../components/InfoPageLayout.vue';
import { t } from '../i18n';
</script>
