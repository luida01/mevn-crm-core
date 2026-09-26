import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { useCartStore } from './stores/cartStore'
import { initializePreferences } from './i18n'

const pinia = createPinia()
const app = createApp(App)
initializePreferences()

app.use(pinia)
app.use(router)
useCartStore(pinia).hydrate()
app.mount('#app')
