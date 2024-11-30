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
import { ref, computed, onMounted } from 'vue'
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
  name: 'PredictStockChart',
  components: {
    Bar,
    Line
  },
  setup() {
    const isBarChart = ref(false) // Default to Line chart
    const chartData = ref({
      labels: [],
      datasets: [
        {
          label: 'Training',
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.6)', // New color
          borderColor: 'rgba(54, 162, 235, 1)', // New color
          borderWidth: 1,
          pointStyle: false // Disable point style
        },
        {
          label: 'Predictions',
          data: [],
          backgroundColor: 'rgba(255, 99, 132, 0.6)', // New color
          borderColor: 'rgba(255, 99, 132, 1)', // New color
          borderWidth: 1,
          pointStyle: false // Disable point style
        },
        {
          label: 'New Data',
          data: [],
          backgroundColor: 'rgba(75, 192, 192, 0.6)', // New color
          borderColor: 'rgba(75, 192, 192, 1)', // New color
          borderWidth: 1,
          pointStyle: false // Disable point style
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

        //console.log(newData);
        

        updateChartData(newData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    const updateChartData = (data: any) => {
      if (!data) {
        console.warn('No data available to update chart')
        return
      }

      const trainingDates = data.training?.Date || []
      const testingDates = data.testing?.Date || []

      const trainingValues = data.training?.actual_values || []
      const testingValues = data.testing?.actual_values || []

      const newValues = data.data.stockdata
      const newDates = data.data.stockdates

      console.log("newValues" , newValues);
      console.log("newDates" , newDates);

      const newDatesFormatted = newDates.map(date => {
        const parsedDate = new Date(date)
        return isNaN(parsedDate.getTime()) ? 'Invalid Date' : new Intl.DateTimeFormat().format(parsedDate)
      })

      console.log('Updating chart data...')

      const dateFormatter = new Intl.DateTimeFormat()
      const formattedTrainingDates = trainingDates.map(date => {
        const parsedDate = new Date(date)
        return isNaN(parsedDate.getTime()) ? 'Invalid Date' : dateFormatter.format(parsedDate)
      })
      const formattedTestingDates = testingDates.map(date => {
        const parsedDate = new Date(date)
        return isNaN(parsedDate.getTime()) ? 'Invalid Date' : dateFormatter.format(parsedDate)
      })

      const totalLength = trainingValues.length + testingValues.length + newValues.length

      if (totalLength > 0) {
        chartData.value.labels = formattedTrainingDates.concat(formattedTestingDates).concat(newDatesFormatted)
        chartData.value.datasets[0].data = trainingValues.concat(new Array(testingValues.length + newValues.length).fill(null))
        chartData.value.datasets[1].data = new Array(trainingValues.length).fill(null).concat(testingValues).concat(new Array(newValues.length).fill(null))
        chartData.value.datasets[2].data = new Array(trainingValues.length + testingValues.length).fill(null).concat(newValues)
        console.log('Updated chart data:', chartData.value)
      } else {
        console.warn('Invalid array length detected')
      }
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

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>