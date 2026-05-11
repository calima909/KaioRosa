import 'virtual:uno.css'
import '@unocss/reset/tailwind-v4.css'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
