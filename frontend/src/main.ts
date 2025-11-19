import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './styles/main.css'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

// Check authentication status before installing router
const authStore = useAuthStore()
authStore.checkAuth().finally(() => {
  app.use(router)
  app.mount('#app')
})
