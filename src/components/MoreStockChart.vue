<template>
  <div>
    <v-btn-group>
      <v-btn
        v-for="dataset in additionalDatasets"
        :key="dataset.label"
        :color="isDatasetActive(dataset.label) ? 'primary' : ''"
        @click="toggleDataset(dataset)"
      >
        {{ dataset.label }}
      </v-btn>
    </v-btn-group>
    <component
      :is="currentChartComponent"
      v-if="chartData.labels.length > 0"
      :data="chartData"
      :options="options"
      :key="chartUpdateTrigger"
    />
    <p v-else>{{ isLoading ? 'Loading data...' : error || 'No data available' }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
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
import { debounce } from 'lodash'

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
  date: string
  Close: number
  Open?: number
  High?: number
  Low?: number
  Volume?: number
  [key: string]: any
}

interface Dataset {
  label: string
  field: string
  color: string
  yAxisID?: string
}

export default defineComponent({
  name: 'MoreStockChart',
  components: {
    //Bar,
    Line
  },
  props: {
    initialSymbol: {
      type: String,
      default: 'AAPL'
    }
  },
  setup(props) {
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const isBarChart = ref(false)
    const inputSymbol = ref(props.initialSymbol)
    const selectedTimeFrame = ref('1M')
    const chartUpdateTrigger = ref(0)
    const dataCache = ref<{ [symbol: string]: StockData[] }>({})

    const additionalDatasets = ref<Dataset[]>([
      {
        label: 'Volume',
        field: 'Volume',
        color: 'rgba(153, 102, 255, 0.6)',
       
      },
      {
        label: 'High',
        field: 'High',
        color: 'rgba(255, 99, 132, 0.6)'
      },
      {
        label: 'Low',
        field: 'Low',
        color: 'rgba(54, 162, 235, 0.6)'
      }
    ])

    const chartData = ref({
      labels: [],
      datasets: [
        {
          label: 'Close Price',
          data: [],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    })

    const options = ref({
      responsive: true,
      animation: false,
    
      scales: {
        y: {
          beginAtZero: false,
          position: 'left',
          title: {
            display: true,
            text: 'Price ($)'
          }
        },
        y1: {
          position: 'right',
          grid: {
            drawOnChartArea: false
          },
          title: {
            display: true,
            text: 'Volume'
          },
          display: false
        }
      }
    })

    const stockData = ref<StockData[]>([])
    const lastFilteredData = ref<StockData[]>([])

    const currentChartComponent = computed(() => (isBarChart.value ? Line : Line))

    const fetchData = async () => {
      isLoading.value = true
      error.value = null

      try {
        if (dataCache.value[inputSymbol.value]) {
          stockData.value = dataCache.value[inputSymbol.value]
        } else {
          const response = await fetch(`/api/stocks/${inputSymbol.value}`)

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const newData = await response.json()

          // Modified this section to handle the array directly
          if (!Array.isArray(newData)) {
            throw new Error('Invalid data format received from API')
          }

          const validatedData = newData.filter((item: any) => {
            return (
              item &&
              typeof item.date === 'string' &&
              !isNaN(new Date(item.date).getTime()) &&
              typeof item.Close !== 'undefined'
            )
          })

          if (validatedData.length === 0) {
            throw new Error('No valid data points found')
          }

          stockData.value = validatedData.sort(
            (a: StockData, b: StockData) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )

          dataCache.value[inputSymbol.value] = stockData.value
        }

        updateChartData()
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'An error occurred'
        console.error('Error fetching data:', err)
        chartData.value.labels = []
        chartData.value.datasets[0].data = []
      } finally {
        isLoading.value = false
      }
    }

    const filterDataByTimeFrame = (data: StockData[]) => {
      if (!Array.isArray(data) || data.length === 0) return []

      const lastDate = new Date(data[data.length - 1].date)
      let startDate = new Date(lastDate)

      switch (selectedTimeFrame.value) {
        case '1W':
          startDate.setDate(startDate.getDate() - 7)
          break
        case '1M':
          startDate.setMonth(startDate.getMonth() - 1)
          break
        case '3M':
          startDate.setMonth(startDate.getMonth() - 3)
          break
        default:
          startDate = new Date(data[0].date)
      }

      const startTime = startDate.getTime()
      const endTime = lastDate.getTime()

      return data.filter((item) => {
        const itemTime = new Date(item.date).getTime()
        return itemTime >= startTime && itemTime <= endTime
      })
    }

    const formatChartDate = (dateStr: string) => {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
    }

    const updateChartData = () => {
      if (!Array.isArray(stockData.value)) {
        console.error('Stock data is not an array')
        return
      }

      const filteredData = filterDataByTimeFrame(stockData.value)

      if (JSON.stringify(filteredData) === JSON.stringify(lastFilteredData.value)) {
        return
      }

      lastFilteredData.value = filteredData

      const activeDatasets = chartData.value.datasets
        .map((ds) => ds.label)
        .filter((label) => label !== 'Close Price')

      chartData.value = {
        labels: filteredData.map((item) => formatChartDate(item.date)),
        datasets: [
          {
            label: 'Close Price',
            data: filteredData.map((item) => item.Close),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          ...activeDatasets
            .map((label) => {
              const dataset = additionalDatasets.value.find((ds) => ds.label === label)
              if (!dataset) return null
              return {
                label: dataset.label,
                data: filteredData.map((item) => item[dataset.field]),
                backgroundColor: dataset.color,
                borderColor: dataset.color.replace('0.6', '1'),
                borderWidth: 1,
                ...(dataset.yAxisID ? { yAxisID: dataset.yAxisID, type: 'bar' } : {})
              }
            })
            .filter(Boolean)
        ]
      }
    }

    const isDatasetActive = (label: string) => {
      return chartData.value.datasets.some((ds) => ds.label === label)
    }

    const toggleDataset = (dataset: Dataset) => {
      const index = chartData.value.datasets.findIndex((ds) => ds.label === dataset.label)
      if (index === -1) {
        addDataSet(dataset)
      } else {
        chartData.value.datasets.splice(index, 1)
        if (dataset.yAxisID === 'y1') {
          options.value.scales.y1.display = false
        }
        chartUpdateTrigger.value++
      }
    }

    const addDataSet = (dataset: Dataset) => {
      if (!Array.isArray(stockData.value)) return

      const filteredData = filterDataByTimeFrame(stockData.value)
      chartData.value.datasets.push({
        label: dataset.label,
        data: filteredData.map((item) => item[dataset.field]),
        backgroundColor: dataset.color,
        borderColor: dataset.color.replace('0.6', '1'),
        borderWidth: 1,
        ...(dataset.yAxisID
          ? {
              yAxisID: dataset.yAxisID,
              type: 'bar'
            }
          : {})
      })

      if (dataset.yAxisID === 'y1') {
        options.value.scales.y1.display = true
      }
      chartUpdateTrigger.value++
    }

    const debouncedUpdateChartData = debounce(updateChartData, 300)

    watch(
      [inputSymbol, selectedTimeFrame],
      () => {
        debouncedUpdateChartData()
      },
      { immediate: true }
    )

    onMounted(fetchData)

    return {
      isLoading,
      error,
      isBarChart,
      inputSymbol,
      selectedTimeFrame,
      currentChartComponent,
      chartData,
      options,
      toggleChartType: () => {
        isBarChart.value = !isBarChart.value
        chartUpdateTrigger.value++
      },
      chartUpdateTrigger,
      fetchData,
      isDatasetActive,
      toggleDataset,
      additionalDatasets
    }
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 60vh;
  width: 100%;
}
</style>
