<template>
  <div v-if="data && data.summary">
    <div class="forecast-container">
      <Line :data="chartData" :options="chartOptions" />
      <!-- Tooltip overlay, initially hidden -->
      <div class="tooltip-overlay">
        <div>Start Price: {{ data.summary.start_price }}</div>
        <div>End Price: {{ data.summary.end_price }}</div>
        <div>Overall Change (Percent): {{ data.summary.overall_change_percent }}%</div>
      </div>
    </div>
  </div>
  <div v-else>
    Loading forecast...
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// Updated props type to use "weekly_forecast" instead of "forecast"
const props = defineProps<{
  data: {
    weekly_forecast?: Array<{ day: number; date: string; price: number; change_percent: number }>,
    summary?: { start_price: number; end_price: number; overall_change_percent: number }
  }
}>()

const dataForecast = computed(() =>
  props.data?.weekly_forecast && props.data.weekly_forecast.length > 0
    ? props.data.weekly_forecast
    : [{ day: 0, date: 'N/A', price: 0, change_percent: 0 }]
)

const chartData = computed(() => ({
  labels: dataForecast.value.map(item => item.date),
  datasets: [
    {
      label: 'Price',
      data: dataForecast.value.map(item => item.price),
      borderColor: '#42A5F5',
      backgroundColor: 'rgba(66, 165, 245, 0.2)',
      fill: true,
      tension: 0.3,
      pointRadius: 2
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false } // disable default tooltip
  },
  scales: {
    x: { display: false },
    y: { display: false }
  }
}
</script>

<script lang="ts">
export default {
  name: 'ForecastMiniChart'
  // Removed duplicate props declaration; using defineProps in <script setup>
};
</script>

<style scoped>
.forecast-container {
  position: relative;
  width: 100px;
  height: 50px;
}

.tooltip-overlay {
  position: absolute;
  bottom: 70%; /* Position above the chart */
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px;
  border-radius: 4px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  white-space: normal; /* Allow wrapping */
  text-align: center;
  width: 250px;
}

.forecast-container:hover .tooltip-overlay {
  opacity: 1;
}
</style>
