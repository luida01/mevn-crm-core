import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';
import { initializePreferences } from './i18n';

const app = createApp(App);
initializePreferences();
app.use(createPinia());
app.use(router);
app.mount('#app');
