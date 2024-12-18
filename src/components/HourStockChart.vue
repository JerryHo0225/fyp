<template>
  <div>
    <div class="time-filters">
      <v-btn
        v-for="period in timePeriods"
        :key="period.value"
        variant="outlined"
        :color="selectedTimeFrame === period.value ? 'primary' : ''"
        @click="filterData(period.value)"
        :loading="isLoading"
      >
        {{ period.label }}
      </v-btn>
    </div>

    <div class="chart-controls">
      <v-btn variant="outlined" @click="toggleChartType" :loading="isLoading">
        Switch to {{ isBarChart ? 'Line' : 'Bar' }} Chart
      </v-btn>

      <v-btn-group variant="outlined">
        <v-btn
          v-for="dataset in additionalDatasets"
          :key="dataset.label"
          :color="isDatasetActive(dataset.label) ? 'primary' : ''"
          @click="toggleDataset(dataset)"
          :loading="isLoading"
        >
          {{ dataset.label }}
        </v-btn>
      </v-btn-group>

      <v-btn variant="outlined" @click="removeDataSets" :loading="isLoading"> Reset </v-btn>
    </div>

    <v-progress-linear v-if="isLoading" indeterminate color="primary"></v-progress-linear>

    <component
      :is="currentChartComponent"
      v-if="chartData.labels.length > 0"
      :data="chartData"
      :options="options"
      :key="chartUpdateTrigger"
    />

    <v-alert v-else-if="error" type="error" dense>
      {{ error }}
    </v-alert>

    <v-alert v-else type="info" dense> Loading data... </v-alert>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, reactive, watch } from 'vue'
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
import { format } from 'date-fns'
    import { debounce } from 'lodash';

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
  Date: string
  Open: number
  High: number
  Low: number
  Close: number
  'Adj Close': number
  Volume: number
}

interface Dataset {
  label: string
  field: keyof StockData
  color: string
  yAxisID?: string
}

export default defineComponent({
  name: 'StockChart',
  components: {
    Bar,
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
    const isBarChart = ref(true)
    const inputSymbol = ref(props.initialSymbol)
    const selectedTimeFrame = ref('1M')
    const chartUpdateTrigger = ref(0)

    const timePeriods = [
      { label: '1D', value: '1D' },
      { label: '5D', value: '5D' },
      { label: '1M', value: '1M' },
      { label: '3M', value: '3M' },
      { label: 'YTD', value: 'YTD' },
      { label: '1Y', value: '1Y' },
      { label: '5Y', value: '5Y' },
      { label: 'ALL', value: 'ALL' }
    ]

    const additionalDatasets: Dataset[] = [
      { label: 'High', field: 'High', color: 'rgba(255, 99, 132, 0.6)' },
      { label: 'Low', field: 'Low', color: 'rgba(54, 162, 235, 0.6)' },
      { label: 'Open', field: 'Open', color: 'rgba(153, 102, 255, 0.6)' },
      { label: 'Volume', field: 'Volume', color: 'rgba(255, 206, 86, 0.6)', yAxisID: 'y1' }
    ]

    const dataCache = ref<{ [symbol: string]: StockData[] }>({});

    const chartData = ref({
      labels: [],
      datasets: [
        {
          label: 'Close Price',
          data: [],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          pointStyle: false
        }
      ]
    })

    const options = ref({
      responsive: true,
      animation: false, // Disable animations
      interaction: {
        mode: 'index' as const,
        intersect: false
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            //autoSkip: true,
            maxTicksLimit: 12
          }
        },
        y: {
         // type: 'linear' as const,
          display: true,
          position: 'left' as const,
          title: {
            display: true,
            text: 'Price'
          }
        },
        y1: {
          type: 'linear' as const,
          display: false,
          position: 'right' as const,
          title: {
            display: true,
            text: 'Volume'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: (tooltipItems: any[]) => {
              return tooltipItems[0].label
            },
            label: (context: any) => {
              let label = context.dataset.label || ''
              if (label) {
                label += ': '
              }
              if (context.parsed.y !== null) {
                if (label.includes('Volume')) {
                  label += new Intl.NumberFormat('en-US').format(context.parsed.y)
                } else {
                  label += new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(context.parsed.y)
                }
              }
              return label
            }
          }
        }
      }
    })

    const stockData = ref<StockData[]>([])
    const lastFilteredData = ref<StockData[]>([]);

    const currentChartComponent = computed(() => (isBarChart.value ? Bar : Line))

    const formatChartDate = (dateString: string) => {
      try {
        const date = new Date(dateString)

        switch (selectedTimeFrame.value) {
          case '1D':
          case '5D':
            return format(date, 'MMM d, HH:mm')
          case '1M':
          case '3M':
            return format(date, 'MMM d')
          case 'YTD':
          case '1Y':
          case '5Y':
            return format(date, 'MMM yyyy')
          default:
            return format(date, 'yyyy')
        }
      } catch (error) {
        console.error('Date formatting error:', error)
        return dateString
      }
    }

    const filterDataByTimeFrame = (data: StockData[]) => {
      if (!data || data.length === 0) return []

      const sortedData = [...data].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      //no problem here
      const lastDate = new Date(sortedData[sortedData.length - 1].date)
      let startDate = new Date(lastDate)

      switch (selectedTimeFrame.value) {
        case '1D':
          const oneDayAgo = new Date(lastDate)
          oneDayAgo.setDate(lastDate.getDate() - 1)

          return sortedData.filter((item) => new Date(item.date) >= oneDayAgo)

        case '5D':
          const fiveDaysAgo = new Date(lastDate)
          fiveDaysAgo.setDate(lastDate.getDate() - 5)
          return sortedData.filter((item) => new Date(item.date) >= fiveDaysAgo)

        case '1M':
          startDate.setMonth(lastDate.getMonth() - 1)

          break

        case '3M':
          startDate.setMonth(lastDate.getMonth() - 3)
          break

        case 'YTD':
          startDate = new Date(lastDate.getFullYear(), 0, 1)
          break

        case '1Y':
          startDate.setFullYear(lastDate.getFullYear() - 1)

          break

        case '5Y':
          startDate.setFullYear(lastDate.getFullYear() - 5)
          break

        case 'ALL':
          return sortedData
      }

      return sortedData.filter((item) => {
        const itemDate = new Date(item.date)
        return itemDate >= startDate && itemDate <= lastDate
      })
    }

    const toggleChartType = () => {
      isBarChart.value = !isBarChart.value
      chartUpdateTrigger.value++
    }

    const isDatasetActive = (label: string) => {
      return chartData.datasets.some((ds) => ds.label === label)
    }

    const toggleDataset = (dataset: Dataset) => {
      const index = chartData.datasets.findIndex((ds) => ds.label === dataset.label)
      if (index === -1) {
        addDataSet(dataset)
      } else {
        chartData.datasets.splice(index, 1)
        if (dataset.yAxisID === 'y1') {
          options.scales.y1.display = false
        }
        chartUpdateTrigger.value++
      }
    }

    const addDataSet = (dataset: Dataset) => {
      const filteredData = filterDataByTimeFrame(stockData.value)
      chartData.datasets.push({
        label: dataset.label,
        data: filteredData.map((item) => item[dataset.field]),
        backgroundColor: dataset.color,
        borderColor: dataset.color.replace('0.6', '1'),
        borderWidth: 1,
        pointStyle: false,
        ...(dataset.yAxisID
          ? {
              yAxisID: dataset.yAxisID,
              type: 'bar'
            }
          : {})
      })

      if (dataset.yAxisID === 'y1') {
        options.scales.y1.display = true
      }

      chartUpdateTrigger.value++
    }

    const removeDataSets = () => {
      chartData.datasets = [chartData.datasets[0]]
      options.scales.y1.display = false
      chartUpdateTrigger.value++
    }

    const updateChartData = () => {
      const filteredData = filterDataByTimeFrame(stockData.value)

      chartData.labels = filteredData.map((item) => formatChartDate(item.date))
      chartData.datasets[0].data = filteredData.map((item) => item.Close)

      chartData.datasets.forEach((dataset, index) => {
        if (index === 0) return
        const datasetConfig = additionalDatasets.find((ads) => ads.label === dataset.label)
        if (datasetConfig) {
          dataset.data = filteredData.map((item) => item[datasetConfig.field])
        }
      })

      options.scales.x.ticks.maxTicksLimit = determineMaxTicks(selectedTimeFrame.value)

      chartUpdateTrigger.value++
    }

    const determineMaxTicks = (timeFrame: string): number => {
      switch (timeFrame) {
        case '1D':
          return 6
        case '5D':
          return 10
        case '1M':
          return 15
        case '3M':
          return 12
        case 'YTD':
        case '1Y':
          return 12
        case '5Y':
          return 10
        case 'ALL':
          return 10
        default:
          return 12
      }
    }

    const fetchData = async () => {
      isLoading.value = true
      error.value = null

      try {
        if (dataCache.value[inputSymbol.value]) {
          stockData.value = dataCache.value[inputSymbol.value];
        } else {
          const response = await fetch(`/api/stocks/${inputSymbol.value}/date/20240222/hour`);

          console.log(response);
          

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const newData = await response.json()
          stockData.value = Array.isArray(newData)
            ? newData
            : newData.data && Array.isArray(newData.data)
              ? newData.data
              : []

          stockData.value.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          dataCache.value[inputSymbol.value] = stockData.value;
        }

        if (stockData.value.length === 0) {
          throw new Error('No data available')
        }

        updateChartData()
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'An error occurred'
        console.error('Error fetching data:', err)
      } finally {
        isLoading.value = false
      }
    }

    // Use debounced updateChartData

    const debouncedUpdateChartData = debounce(updateChartData, 300);

    watch(
      [inputSymbol, selectedTimeFrame],
      () => {
        debouncedUpdateChartData();
      },
      { immediate: true }
    );

    onMounted(fetchData)

    return {
      chartData,
      options,
      isBarChart,
      currentChartComponent,
      toggleChartType,
      removeDataSets,
      chartUpdateTrigger,
      inputSymbol,
      fetchData,
      filterData: (timeFrame: string) => {
        selectedTimeFrame.value = timeFrame
        updateChartData()
      },
      selectedTimeFrame,
      timePeriods,
      isLoading,
      error,
      additionalDatasets,
      toggleDataset,
      isDatasetActive
    }
  }
})
</script>

<style scoped>
.time-filters {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.chart-controls {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.v-btn {
  text-transform: none;
}

.v-progress-linear {
  margin: 1rem 0;
}
</style>
