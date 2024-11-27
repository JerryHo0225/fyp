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
          label: 'Training',
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.6)', // New color
          borderColor: 'rgba(54, 162, 235, 1)', // New color
          borderWidth: 1
        },{
          label: 'Predictions',
          data: [],
          backgroundColor: 'rgba(255, 99, 132, 0.6)', // New color
          borderColor: 'rgba(255, 99, 132, 1)', // New color
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

        const response1 = await fetch(`/api/stocks/MSFT`)
        const newData1 = await response1.json()
        console.log('API Response:', newData1)

        updateChartData(newData.data)
        updateChartData1(newData1.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    const updateChartData = (predictions: string[]) => {
      const combinedDates = predictions.training.Date.concat(predictions.testing.Date)
      const combinedValues = predictions.training.actual_values.concat(predictions.testing.actual_values)

      console.log('Updating chart data...')

      console.log('Predictions:', predictions);
      

      if (predictions.length === 0) {
        console.warn('No predictions available to update chart')
        return
      }
      

      const dateFormatter = new Intl.DateTimeFormat()
      chartData.value.labels = combinedDates.map(date => {
        const parsedDate = new Date(date)
        return isNaN(parsedDate.getTime()) ? 'Invalid Date' : dateFormatter.format(parsedDate)
      })
      chartData.value.datasets[0].data = combinedValues
      console.log('Updated chart data:', chartData.value)


    }

    const updateChartData1 = (predictions: string[]) => {
      const combinedDates = predictions.training.Date.concat(predictions.testing.Date)
      const combinedValues = predictions.training.actual_values.concat(predictions.testing.actual_values)

      console.log('Updating chart data...')

      console.log('Predictions:', predictions);
      

      if (predictions.length === 0) {
        console.warn('No predictions available to update chart')
        return
      }
      

      const dateFormatter = new Intl.DateTimeFormat()
      chartData.value.labels = combinedDates.map(date => {
        const parsedDate = new Date(date)
        return isNaN(parsedDate.getTime()) ? 'Invalid Date' : dateFormatter.format(parsedDate)
      })
      chartData.value.datasets[1].data = combinedValues
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