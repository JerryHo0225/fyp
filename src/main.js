import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import "bootstrap"

import '@oruga-ui/theme-bootstrap/dist/bootstrap.css';
import '@mdi/font/css/materialdesignicons.min.css';
import VueApexCharts from "vue3-apexcharts";

import { bootstrapConfig } from '@oruga-ui/theme-bootstrap';
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import Oruga from '@oruga-ui/oruga-next'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    components,
    directives,
  })

const app = createApp(App)

app.use(router).use(Oruga, bootstrapConfig).use(VueApexCharts).use(vuetify)

app.mount('#app')