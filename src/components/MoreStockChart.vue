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
  _id: string;
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  'Adj Close': number;
  Volume: number;
  Symbol: string;
}

export default {
  name: 'MoreStockChart',
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
          label: 'Close Price',
          data: [],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Volume',
          data: [],
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        },
        {
          label: 'Open',
          data: [],
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }
      ]
    })
    const options = ref({
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          position: 'left' as const,
          title: {
            display: true,
            text: 'Close Price'
          }
        },
        y1: {
          beginAtZero: true,
          position: 'right' as const,
          title: {
            display: true,
            text: 'Volume'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    })
    const stockData = ref<StockData[]>([])
    const skip = ref(0)
    const limit = 10 // Adjust as needed

    const currentChartComponent = computed(() => isBarChart.value ? Bar : Line)

    const toggleChartType = () => {
      isBarChart.value = !isBarChart.value
    }

    const fetchData = async () => {
      try {
        console.log('Fetching data...')
        var stockSyboml = "AAPL"
        
         const response = await fetch(`/api/stocks/${stockSyboml}`)
        //const response = await fetch(`/api/stocks`)
        

        const newData = await response.json()
        console.log('API Response:', newData)

        if (Array.isArray(newData)) {
          stockData.value = newData
        } else if (newData.data && Array.isArray(newData.data)) {
          stockData.value = newData.data
        } else {
          console.error('Fetched data is not in expected format:', newData)
          return
        }

        console.log('Stock data after fetch:', stockData.value)

        skip.value += limit
        await nextTick()
        updateChartData()
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    const updateChartData = () => {
      console.log('Updating chart data...')
      if (stockData.value.length === 0) {
        console.warn('No stock data available to update chart')
        return
      }

      chartData.value.labels = stockData.value.map(item => {
        const date = new Date(item.Date)
        return date.toLocaleDateString()
      })
      chartData.value.datasets[0].data = stockData.value.map(item => item.Close)
      chartData.value.datasets[1].data = stockData.value.map(item => item.Volume)
      chartData.value.datasets[2].data = stockData.value.map(item => item.Open)
      

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