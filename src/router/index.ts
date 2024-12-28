
import { createRouter, createWebHistory } from 'vue-router'
import ChoosePrediction from '@/views/ChoosePrediction.vue'
import PredictionResult from '@/views/PredictionResult.vue'
// ...existing code...

const routes = [
  // ...existing routes...
  {
    path: '/choose-prediction',
    name: 'ChoosePrediction',
    component: ChoosePrediction
  },
  {
    path: '/prediction-result',
    name: 'PredictionResult',
    component: PredictionResult
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router