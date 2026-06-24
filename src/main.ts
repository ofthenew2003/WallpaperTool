import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/globals.css'

const app = createApp(App)

app.config.errorHandler = (err, _vm, info) => {
  console.error('全局错误:', err, info)
}

app.use(createPinia())
app.use(router)
app.mount('#app')
