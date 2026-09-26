<template>
  <InfoPageLayout
    :eyebrow="t('policy.returnEyebrow')"
    :title="t('policy.returnTitle')"
    :description="t('policy.returnDescription')"
    :notice="t('policy.returnNotice')"
  >
    <section class="info-card">
      <p class="info-card__eyebrow">{{ t('policy.rentals') }}</p>
      <h2>{{ t('policy.returnRecord') }}</h2>
      <p>{{ t('policy.returnDescriptionLong') }}</p>
      <div class="info-callout"><strong>{{ t('policy.internalOnly') }}</strong><span>{{ t('policy.noPickup') }}</span></div>
    </section>

    <section class="info-card">
      <p class="info-card__eyebrow">{{ t('policy.purchases') }}</p>
      <h2>{{ t('policy.disabled') }}</h2>
      <p>{{ t('policy.noRefunds') }}</p>
    </section>

    <section class="info-card info-card--tinted">
      <p class="info-card__eyebrow">{{ t('policy.beforeService') }}</p>
      <h2>{{ t('policy.conditionsMissing') }}</h2>
      <p>{{ t('policy.conditionsMissingText') }}</p>
    </section>

    <nav class="info-related" :aria-label="t('policy.moreInfo')">
      <router-link to="/rental-policies">{{ t('footer.rentals') }} <span aria-hidden="true">↗</span></router-link>
      <router-link to="/faq">{{ t('footer.faq') }} <span aria-hidden="true">↗</span></router-link>
      <router-link to="/terms">{{ t('faq.terms') }} <span aria-hidden="true">↗</span></router-link>
    </nav>
  </InfoPageLayout>
</template>

<script setup lang="ts">
import InfoPageLayout from '../components/InfoPageLayout.vue';
import { t } from '../i18n';
</script>
