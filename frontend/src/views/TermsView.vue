<template>
  <InfoPageLayout
    :eyebrow="t('policy.legalEyebrow')"
    :title="t('policy.termsTitle')"
    :description="t('policy.termsDescription')"
    :notice="t('policy.termsNotice')"
  >
    <section class="info-card">
      <p class="info-card__eyebrow">{{ t('policy.scope') }}</p>
      <h2>{{ t('policy.publicCatalog') }}</h2>
      <p>{{ t('policy.catalogScope') }}</p>
    </section>

    <section class="info-card">
      <p class="info-card__eyebrow">{{ t('policy.prices') }}</p>
      <h2>{{ t('policy.managedInfo') }}</h2>
      <p>{{ t('policy.stockInfo') }}</p>
    </section>

    <section class="info-card">
      <p class="info-card__eyebrow">{{ t('policy.operations') }}</p>
      <h2>{{ t('policy.preparing') }}</h2>
      <p>{{ t('policy.rentalOrderInfo') }}</p>
      <div class="info-related info-related--inline">
        <router-link to="/rental-policies">{{ t('policy.rentalStatus') }} <span aria-hidden="true">↗</span></router-link>
        <router-link to="/return-policy">{{ t('policy.returnStatus') }} <span aria-hidden="true">↗</span></router-link>
      </div>
    </section>

    <section class="info-card info-card--tinted">
      <p class="info-card__eyebrow">{{ t('policy.pendingData') }}</p>
      <h2>{{ t('policy.incomplete') }}</h2>
      <p>{{ t('policy.dataRights') }}</p>
    </section>

    <p class="info-page__updated">{{ t('policy.draftDate') }}</p>
  </InfoPageLayout>
</template>

<script setup lang="ts">
import InfoPageLayout from '../components/InfoPageLayout.vue';
import { t } from '../i18n';
</script>
