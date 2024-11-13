<template>
  <div>
    <button @click="toggleChartType">
      Switch to {{ isBarChart ? 'Line' : 'Bar' }} Chart
    </button>
    <component 
      :is="currentChartComponent" 
      v-if="chartData.labels.length > 0" 
      :data="chartData" 
      :options="options" 
    />
    <p v-else>Loading data or no data available...</p>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Bar, Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend
)

interface StockData {
  predictions: number[];
}

export default {
  name: 'StockChart',
  components: {
    Bar,
    Line
  },
  setup() {
    const isBarChart = ref(true)
    const chartData = ref({
      labels: [],
      datasets: [
        {
          label: 'Predictions',
          data: [],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    })
    const options = ref({
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Predicted Values'
          }
        }
      }
    })

    const currentChartComponent = computed(() => isBarChart.value ? Bar : Line)

    const toggleChartType = () => {
      isBarChart.value = !isBarChart.value
    }

    const fetchData = async () => {
      try {
        console.log('Fetching data...')
        const response = await fetch(`/api/predict`)
        const newData = await response.json()
        console.log('API Response:', newData)

        if (!Array.isArray(newData.predictions)) {
          console.error('Fetched data is not in expected format:', newData)
          return
        }

        updateChartData(newData.predictions)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    const updateChartData = (predictions: number[]) => {
      console.log('Updating chart data...')
      if (predictions.length === 0) {
        console.warn('No predictions available to update chart')
        return
      }

      chartData.value.labels = predictions.map((_, index) => `Prediction ${index + 1}`)
      chartData.value.datasets[0].data = predictions

      console.log('Updated chart data:', chartData.value)
    }

    onMounted(() => {
      console.log('Component mounted')
      fetchData()
    })

    return {
      chartData,
      options,
      isBarChart,
      currentChartComponent,
      toggleChartType
    }
  }
}
</script>