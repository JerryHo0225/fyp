<template>
  <div>
    <!-- Dataset Selection Buttons -->
    <v-btn-group>
      <v-btn
        v-for="dataset in additionalDatasets"
        :key="dataset.label"
        :color="isDatasetActive(dataset.label) ? 'primary' : 'default'"
        @click="toggleDataset(dataset)"
      >
        {{ dataset.label }}
      </v-btn>
    </v-btn-group>

    <!-- Time Frame Selection Buttons -->
    <v-btn-group class="mt-4">
      <v-btn
        v-for="timeFrame in timeFrames"
        :key="timeFrame"
        :color="selectedTimeFrame === timeFrame ? 'primary' : 'default'"
        @click="selectedTimeFrame = timeFrame"
      >
        {{ timeFrame }}
      </v-btn>
    </v-btn-group>

    <!-- Display Selected Time Frame -->
    <div class="mt-2">
      <strong>Selected Time Frame:</strong>
      {{ selectedTimeFrameLabel }}
    </div>

    <!-- Line Chart Component -->
    <component
      :is="currentChartComponent"
      v-if="chartData.labels.length > 0"
      :data="chartData"
      :options="options"
      :key="chartUpdateTrigger"
      class="mt-4 chart-container"
    />

    <!-- Loading and Error Messages -->
    <p v-else>
      {{ isLoading ? 'Loading data...' : error || 'No data available' }}
    </p>
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
  type?: string
}

export default defineComponent({
  name: 'MoreStockChart',
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
    const isBarChart = ref(false)
    const inputSymbol = ref(props.initialSymbol)
    const selectedTimeFrame = ref('5D')
    const chartUpdateTrigger = ref(0)
    const dataCache = ref<{ [symbol: string]: StockData[] }>({})

    const timeFrames = ref(['1D','5D', '1M','6M', '1Y', '5Y','All'])

    const timeFrameLabels: { [key: string]: string } = {
      '1D': '1 Days',
      '5D': '5 Days',
      '1M': '1 Month',
      '6M': '6 months',
      'YTD': 'The begining of year',
      '1Y': '1 year',
      '5Y': '5 years',
      'All': 'The start of the stock'
    }

    const additionalDatasets = ref<Dataset[]>([
      {
        label: 'Volume',
        field: 'Volume',
        color: 'rgba(153, 102, 255, 0.6)',
        yAxisID: 'y1',
        type: 'bar'
      },
      {
        label: 'High',
        field: 'High',
        color: 'rgba(255, 99, 132, 0.6)',
        type: 'line'
      },
      {
        label: 'Low',
        field: 'Low',
        color: 'rgba(54, 162, 235, 0.6)',
        type: 'line'
      }
    ])

    const chartData = ref({
      labels: [] as string[],
      datasets: [
        {
          label: 'Close Price',
          data: [] as number[],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          fill: false,
          type: 'line' as const,
          pointStyle: false
        }
      ]
    })

    const options = ref({
      responsive: true,
      animation: true,
      interaction: {
        mode: 'index' as const,
        intersect: false
      },
      plugins: {
        tooltip: {
          enabled: false,
          external: (context) => {
            const {chart, tooltip} = context;
            let tooltipEl = chart.canvas.parentNode.querySelector('div.custom-tooltip');

            if (!tooltipEl) {
              tooltipEl = document.createElement('div');
              tooltipEl.classList.add('custom-tooltip');
              tooltipEl.style.background = 'rgba(0, 0, 0, 0.85)';
              tooltipEl.style.borderRadius = '5px';
              tooltipEl.style.color = 'white';
              tooltipEl.style.opacity = '1';
              tooltipEl.style.pointerEvents = 'none';
              tooltipEl.style.position = 'absolute';
              tooltipEl.style.transform = 'translate(-50%, 0)';
              tooltipEl.style.transition = 'all .1s ease';
              tooltipEl.style.minWidth = '200px';
              tooltipEl.style.padding = '10px';

              const table = document.createElement('table');
              table.style.margin = '0px';
              tooltipEl.appendChild(table);
              chart.canvas.parentNode.appendChild(tooltipEl);
            }

            if (tooltip.opacity === 0) {
              tooltipEl.style.opacity = '0';
              return;
            }

            if (tooltip.body) {
              const titleLines = tooltip.title || [];
              const bodyLines = tooltip.body.map(b => b.lines);

              let innerHtml = '<table>';

              innerHtml += '<thead><tr><th colspan="2" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px;">';
              innerHtml += titleLines[0];
              innerHtml += '</th></tr></thead><tbody>';

              bodyLines.forEach((body, i) => {
                const colors = tooltip.labelColors[i];
                const dataset = chart.data.datasets[i];

                console.log('dataset', dataset);
                

                const dataPoint = tooltip.dataPoints[i];
                
                innerHtml += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.1)">';
                innerHtml += `<td style="padding: 5px"><span style="display: inline-block; width: 10px; height: 10px; margin-right: 5px; background-color: ${colors.backgroundColor}; border: 2px solid ${colors.borderColor};"></span>`;
                innerHtml += `${dataset.label}</td>`;
                innerHtml += `<td style="padding: 5px; text-align: right">${dataPoint.formattedValue}</td>`;
                innerHtml += '</tr>';
              });

              if (tooltip.dataPoints && tooltip.dataPoints.length > 0) {
                const values = tooltip.dataPoints.map(p => p.raw);
                const sum = values.reduce((a, b) => a + b, 0);
                const avg = sum / values.length;
                const max = Math.max(...values);
                const min = Math.min(...values);

                innerHtml += '<tr><td colspan="2" style="padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.3)">';
                innerHtml += `<div style="font-size: 0.9em; color: rgba(255,255,255,0.8)">`;
                innerHtml += `<div>Average: ${avg.toFixed(2)}</div>`;
                innerHtml += `<div>Sum: ${sum.toFixed(2)}</div>`;
                innerHtml += `<div>Max: ${max.toFixed(2)}</div>`;
                innerHtml += `<div>Min: ${min.toFixed(2)}</div>`;
                innerHtml += '</div></td></tr>';
              }

              innerHtml += '</tbody></table>';

              tooltipEl.querySelector('table').innerHTML = innerHtml;
            }

            const {offsetLeft: positionX, offsetTop: positionY} = chart.canvas;
            tooltipEl.style.opacity = '1';
            tooltipEl.style.left = positionX + tooltip.caretX + 'px';
            tooltipEl.style.top = positionY + tooltip.caretY + 'px';
            tooltipEl.style.font = tooltip.options.bodyFont.string;
          }
        },
        legend: {
          position: 'top' as const
        },
        title: {
          display: true,
          text: 'Stock Prices Over Time'
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          position: 'left' as const,
          title: {
            display: true,
            text: 'Price ($)'
          }
        },
        y1: {
          beginAtZero: false,
          position: 'right' as const,
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

    const currentChartComponent = computed(() => (isBarChart.value ? Bar : Line))

    const selectedTimeFrameLabel = computed(() => {
      return timeFrameLabels[selectedTimeFrame.value] || selectedTimeFrame.value
    })

    const fetchData = async () => {
      isLoading.value = true
      error.value = null

      try {
        if (dataCache.value[inputSymbol.value]) {
          stockData.value = dataCache.value[inputSymbol.value]
        } else {
          const response = await fetch(`/api/stocks/${inputSymbol.value}`)

          console.log(response)

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const newData = await response.json()

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
        case '1D':
          startDate.setDate(startDate.getDate() - 1)
          break
        case '5D':
          startDate.setDate(startDate.getDate() - 5)
          break
        case '1M':
          startDate.setMonth(startDate.getMonth() - 1)
          break
        case '6M':
          startDate.setMonth(startDate.getMonth() - 6)
          break
        case 'YTD':
          startDate = new Date(lastDate.getFullYear(), 0, 1)
          break
        case '1Y':
          startDate.setFullYear(startDate.getFullYear() - 1)
          break
        case '5Y':
          startDate.setFullYear(startDate.getFullYear() - 5)
          break
        case 'All':
          startDate = new Date(data[0].date)
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
            borderWidth: 1,
            fill: false,
            type: 'line', // Ensure it's a line chart
            pointStyle: false
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
                type: dataset.type || 'line',
                ...(dataset.yAxisID ? { yAxisID: dataset.yAxisID } : {})
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
        type: dataset.type || 'line',
        pointStyle: false,
        ...(dataset.yAxisID ? { yAxisID: dataset.yAxisID } : {})
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
        fetchData()
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
      selectedTimeFrameLabel,
      timeFrames,
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
  height: 100vh;
  width: 100%;
}

.mt-4 {
  margin-top: 1rem;
}

.mt-2 {
  margin-top: 0.5rem;
}
</style>
