<template>
  <v-container fluid class="pa-0">
    <v-row>
      <!-- Left Side Navigation Drawer -->
      <v-col cols="3">
        <v-card>
          <v-card-title>Stock Selector</v-card-title>
          <v-img
            :src="res?.image"
            alt="Company Image"
            height="100"
            :style="{ backgroundColor: '#808080' }"
          ></v-img>
          <v-card-text>
            <p><strong>Currency:</strong> {{ res?.currency }}</p>
            <!-- <p><strong>Beta:</strong> {{ res?.beta }}</p> -->
            <p><strong>Volume Average:</strong> {{ formatNumber(res?.volAvg) }}</p>
            <p><strong>Market Cap:</strong> {{ formatNumber(res?.mktCap) }}</p>
            <p><strong>Last Dividend:</strong> {{ res?.lastDiv }}</p>
            <p><strong>52 Week Range:</strong> {{ res?.range }}</p>
            <v-list dense>
              <v-list-item
                v-for="stock in filteredStocks"
                :key="stock.symbol"
                :value="stock.symbol"
                @click="selectStock(stock.symbol)"
                :href="`http://localhost:5173/viewchart/${stock.symbol}`"
              >
                <v-list-item-title> {{ stock.symbol }} - {{ stock.name }} </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Main Content -->
      <v-col cols="9">
        <!-- Existing content -->
        <div>
          <!-- Add Stock Name Display -->
          <h2 class="text-h4 mb-4" id="abc">
            Company Name - {{ res?.companyName || inputSymbol }}
          </h2>

          <!-- Display Selected Time Frame -->
          <div class="mt-4">
            <strong>Selected Time Frame:</strong>
            {{ selectedTimeFrameLabel }}

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
          </div>

          <!-- Add MA controls before the chart -->
          <v-row align="center" class="ma-controls mb-4">
            <v-col cols="auto">
              <v-text-field
                v-model="maPeriod"
                label="MA Period"
                type="number"
                :rules="[v => v > 0 || 'Period must be positive']"
                style="width: 100px"
                @change="updateMA"
              ></v-text-field>
            </v-col>
            <v-col cols="auto">
              <v-btn
                :color="showMA ? 'primary' : ''"
                @click="toggleMA"
              >
                {{ showMA ? 'Hide MA' : 'Show MA' }}
              </v-btn>
            </v-col>
          </v-row>

          <!-- Add Reset Zoom Button
          <v-btn class="mt-4" @click="resetZoom">Reset Zoom</v-btn> -->

          <!-- Dataset Selection Buttons -->
          <v-btn-group>
            <v-btn
              v-for="dataset in additionalDatasets"
              :key="dataset.label"
              :color="isDatasetActive(dataset.label) ? 'primary' : 'default'"
              @click="toggleDataset(dataset)"
            >
              Apply {{ dataset.label }} to the chart
            </v-btn>
          </v-btn-group>

          <!-- Chart and Stock Information -->
          <div v-if="chartData.labels.length > 0">
            <v-container fluid class="pa-0">
              <component
                :is="currentChartComponent"
                :data="chartData"
                :options="options"
                :key="chartUpdateTrigger"
                class="mt-4 chart-container"
              />
              <canvas ref="chartRef"></canvas>
            </v-container>

            <!-- Stock Information Display with v-card
            <v-card class="mt-4">
              <v-card-title>Stock Information</v-card-title>
              <v-card-text>
                <p><strong>Beta:</strong> {{ res?.beta }}</p>
                <p><strong>Volume Average:</strong> {{ res?.volAvg }}</p>
                <p><strong>Market Cap:</strong> {{ res?.mktCap }}</p>
                <p><strong>Last Dividend:</strong> {{ res?.lastDiv }}</p>
                <p><strong>52 Week Range:</strong> {{ res?.range }}</p>
              </v-card-text>
            </v-card> -->
          </div>

          <!-- Loading and Error Messages -->
          <p v-else>
            {{ isLoading ? 'Loading data...' : error || 'No data available' }}
          </p>
        </div>
      </v-col>
    </v-row>
  </v-container>
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
import zoomPlugin from 'chartjs-plugin-zoom'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
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

interface StockDescription {
  beta: number
  volAvg: number
  mktCap: string
  lastDiv: number
  range: string
  companyName: string
  image: string // Add this line
  currency: string // Add this line
  // ...other fields if necessary
}

interface Stock {
  symbol: string
  name: string
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
    const selectedTimeFrame = ref('1M')
    const chartUpdateTrigger = ref(0)
    const dataCache = ref<{ [symbol: string]: StockData[] }>({})

    const timeFrames = ref(['1M', '6M', '1Y', '5Y', 'All'])
    //const timeFrames = ref(['1D','5D', '1M','6M', '1Y', '5Y','All'])

    const timeFrameLabels: { [key: string]: string } = {
      '1D': '1 Days',
      '5D': '5 Days',
      '1M': '1 Month',
      '6M': '6 Months',
      YTD: 'The begining of year',
      '1Y': '1 Year',
      '5Y': '5 Years',
      All: 'The start of the stock'
    }

    const additionalDatasets = ref<Dataset[]>([
      {
        label: 'Volume',
        field: 'Volume',
        color: 'rgba(153, 102, 255, 0.6)',
        yAxisID: 'y1',
        type: 'bar'
      }
    ])

    const chartData = ref({
      labels: [] as string[],
      datasets: [
        {
          label: 'Close Price',
          data: [] as number[],
          backgroundColor: 'rgba(0, 123, 255, 0.6)', // Blue
          borderColor: 'rgba(0, 123, 255, 1)', // Blue
          borderWidth: 1,
          fill: false,
          type: 'line' as const,
          pointStyle: false
        },
        {
          label: 'Open Price',
          data: [] as number[],
          backgroundColor: 'rgba(128, 0, 128, 0.6)', // Purple
          borderColor: 'rgba(128, 0, 128, 1)', // Purple
          borderWidth: 1,
          fill: false,
          type: 'line' as const,
          pointStyle: false
        },
        {
          label: 'Low Price',
          data: [] as number[],
          backgroundColor: 'rgba(23, 162, 184, 0.6)', // Teal
          borderColor: 'rgba(23, 162, 184, 1)', // Teal
          borderWidth: 1,
          fill: false,
          type: 'line' as const,
          pointStyle: false
        },
        {
          label: 'High Price',
          data: [] as number[],
          backgroundColor: 'rgba(108, 117, 125, 0.6)', // Gray
          borderColor: 'rgba(108, 117, 125, 1)', // Gray
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
            const { chart, tooltip } = context
            let tooltipEl = chart.canvas.parentNode.querySelector('div.custom-tooltip')

            if (!tooltipEl) {
              tooltipEl = document.createElement('div')
              tooltipEl.classList.add('custom-tooltip')
              tooltipEl.style.background = 'rgba(0, 0, 0, 0.85)'
              tooltipEl.style.borderRadius = '5px'
              tooltipEl.style.color = 'white'
              tooltipEl.style.opacity = '1'
              tooltipEl.style.pointerEvents = 'none'
              tooltipEl.style.position = 'absolute'
              tooltipEl.style.transform = 'translate(-50%, 0)'
              tooltipEl.style.transition = 'all .1s ease'
              tooltipEl.style.minWidth = '200px'
              tooltipEl.style.padding = '10px'

              const table = document.createElement('table')
              table.style.margin = '0px'
              tooltipEl.appendChild(table)
              chart.canvas.parentNode.appendChild(tooltipEl)
            }

            if (tooltip.opacity === 0) {
              tooltipEl.style.opacity = '0'
              return
            }

            if (tooltip.body) {
              const titleLines = tooltip.title || []
              const formattedTitle = selectedTimeFrame.value === 'All' 
                ? formatChartDate(titleLines[0], true)  // Pass true for tooltip
                : titleLines[0]
              
              let innerHtml = '<table>'
              innerHtml +=
                '<thead><tr><th colspan="2" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px;">'
              innerHtml += formattedTitle
              innerHtml += '</th></tr></thead><tbody>'

              const bodyLines = tooltip.body.map((b) => b.lines)

              bodyLines.forEach((body, i) => {
                const colors = tooltip.labelColors[i]
                const dataset = chart.data.datasets[i]

                const dataPoint = tooltip.dataPoints[i]

                innerHtml += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.1)">'
                innerHtml += `<td style="padding: 5px"><span style="display: inline-block; width: 10px; height: 10px; margin-right: 5px; background-color: ${colors.backgroundColor}; border: 2px solid ${colors.borderColor};"></span>`
                innerHtml += `${dataset.label}</td>`
                innerHtml += `<td style="padding: 5px; text-align: right">${dataPoint.formattedValue}</td>`
                innerHtml += '</tr>'
              })

              if (tooltip.dataPoints && tooltip.dataPoints.length > 0) {
                const values = tooltip.dataPoints.map((p) => p.raw)
                const sum = values.reduce((a, b) => a + b, 0)
                const avg = sum / values.length
                const max = Math.max(...values)
                const min = Math.min(...values)

                const dataIndex = tooltip.dataPoints[0].dataIndex
                if (dataIndex > 0) {
                  // const yesterday = stockData.value[dataIndex - 1];
                  // const today = stockData.value[dataIndex];
                  // const change = ((today.Close - yesterday.Close) / yesterday.Close) * 100;

                  innerHtml +=
                    '<tr><td colspan="2" style="padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.3)">'
                  innerHtml += `<div style="font-size: 0.9em; color: rgba(255,255,255,0.8)">`
                  // innerHtml += `<div>Percentage Change: ${change.toFixed(2)}%</div>`
                  innerHtml += `<div>   </div>`
                  innerHtml += '</div></td></tr>'
                }
              }

              innerHtml += '</tbody></table>'

              tooltipEl.querySelector('table').innerHTML = innerHtml
            }

            const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas
            tooltipEl.style.opacity = '1'
            tooltipEl.style.left = positionX + tooltip.caretX + 'px'
            tooltipEl.style.top = positionY + tooltip.caretY + 'px'
            tooltipEl.style.font = tooltip.options.bodyFont.string
          }
        },
        legend: {
          position: 'top' as const
        },
        title: {
          display: true,
          text: 'Stock Prices Over Time'
        },
        // zoom: {
        //   pan: {
        //     enabled: true,
        //     mode: 'xy',
        //     onPanComplete: () => {
        //       console.log('Pan completed')
        //     }
        //   },
        //   zoom: {
        //     wheel: {
        //       enabled: true
        //     },
        //     pinch: {
        //       enabled: true
        //     },
        //     scaleMode: 'xy'
        //   }
        // }
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
    const res = ref<StockDescription | null>(null)
    const profile = ref<StockDescription | null>(null)

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
          //console.log(response)

          const response1 = await fetch(`/api/stock_descriptions/${inputSymbol.value}`)

          const response = await fetch(`/api/stocks/alltime/${inputSymbol.value}`)

          // Assign fetched data to res.value instead of shadowing
          //example of data
          //     {
          //   "_id": {
          //     "$oid": "675025406c77e8c0c4373e88"
          //   },
          //   "symbol": "NVDA",
          //   "address": "2788 San Tomas Expressway",
          //   "beta": 1.657,
          //   "ceo": "Mr. Jen-Hsun  Huang",
          //   "changes": 1.63,
          //   "cik": "0001045810",
          //   "city": "Santa Clara",
          //   "companyName": "NVIDIA Corporation",
          //   "country": "US",
          //   "currency": "USD",
          //   "cusip": "67066G104",
          //   "dcf": 59.52888904758956,
          //   "dcfDiff": 80.73111,
          //   "defaultImage": false,
          //   "description": "NVIDIA Corporation provides graphics, and compute and networking solutions in the United States, Taiwan, China, and internationally. The company's Graphics segment offers GeForce GPUs for gaming and PCs, the GeForce NOW game streaming service and related infrastructure, and solutions for gaming platforms; Quadro/NVIDIA RTX GPUs for enterprise workstation graphics; vGPU software for cloud-based visual and virtual computing; automotive platforms for infotainment systems; and Omniverse software for building 3D designs and virtual worlds. Its Compute & Networking segment provides Data Center platforms and systems for AI, HPC, and accelerated computing; Mellanox networking and interconnect solutions; automotive AI Cockpit, autonomous driving development agreements, and autonomous vehicle solutions; cryptocurrency mining processors; Jetson for robotics and other embedded platforms; and NVIDIA AI Enterprise and other software. The company's products are used in gaming, professional visualization, datacenter, and automotive markets. NVIDIA Corporation sells its products to original equipment manufacturers, original device manufacturers, system builders, add-in board manufacturers, retailers/distributors, independent software vendors, Internet and cloud service providers, automotive manufacturers and tier-1 automotive suppliers, mapping companies, start-ups, and other ecosystem participants. It has a strategic collaboration with Kroger Co. NVIDIA Corporation was incorporated in 1993 and is headquartered in Santa Clara, California.",
          //   "exchange": "NASDAQ Global Select",
          //   "exchangeShortName": "NASDAQ",
          //   "fullTimeEmployees": "29600",
          //   "image": "https://images.financialmodelingprep.com/symbol/NVDA.png",
          //   "industry": "Semiconductors",
          //   "ipoDate": "1999-01-22",
          //   "isActivelyTrading": true,
          //   "isAdr": false,
          //   "isEtf": false,
          //   "isFund": false,
          //   "isin": "US67066G1040",
          //   "lastDiv": 0.04,
          //   "mktCap": {
          //     "$numberLong": "3434967400000"
          //   },
          //   "phone": "408 486 2000",
          //   "price": 140.26,
          //   "range": "45.271-152.89",
          //   "sector": "Technology",
          //   "state": "CA",
          //   "volAvg": 255432966,
          //   "website": "https://www.nvidia.com",
          //   "zip": "95051"
          // }

          res.value = await response1.json().then((data) => data[0])
          //profile.value = await response1.json().then((data) => data[0])

          console.log(res.value)

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
          // For "All" timeframe, sample one data point per month
          const monthlyData = data.reduce((acc: StockData[], curr: StockData) => {
            const currDate = new Date(curr.date)
            const lastItem = acc[acc.length - 1]
            if (!lastItem || 
                new Date(lastItem.date).getMonth() !== currDate.getMonth() || 
                new Date(lastItem.date).getFullYear() !== currDate.getFullYear()) {
              acc.push(curr)
            }
            return acc
          }, [])
          return monthlyData
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

    const formatChartDate = (dateStr: string, forTooltip = false) => {
      const date = new Date(dateStr)
      // For "All" timeframe
      if (selectedTimeFrame.value === 'All') {
        // Show month/year in tooltip, only year in chart labels
        return forTooltip ? `${date.getMonth() + 1}/${date.getFullYear()}` : `${date.getFullYear()}`
      }
      // For other timeframes, keep the original format
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
        .filter(
          (label) =>
            label !== 'Close Price' &&
            label !== 'Open Price' &&
            label !== 'Low Price' &&
            label !== 'High Price'
        )

      // Combine all price datasets into a single dataset array
      const priceDatasets = ['Close Price', 'High Price', 'Low Price', 'Open Price']
        .map((label) => {
          const field = label === 'Close Price' ? 'Close' : label.replace(' Price', '')
          const colors = {
            'Close Price': 'rgba(75, 192, 192, 1)',    // Teal
            'High Price': 'rgba(153, 102, 255, 1)',    // Purple
            'Low Price': 'rgba(54, 162, 235, 1)',      // Blue
            'Open Price': 'rgba(255, 159, 64, 1)'      // Orange
          }

          return {
            label: label,
            data: filteredData.map((item) => item[field]),
            backgroundColor: colors[label],
            borderColor: colors[label],
            borderWidth: 1.5, // Slightly thicker lines for better visibility
            fill: false,
            type: 'line',
            pointStyle: false,
            tension: 0.1,
            yAxisID: 'y'
          }
        })
        .filter((dataset) => {
          return (
            dataset.label === 'Close Price' ||
            dataset.label === 'Open Price' ||
            dataset.label === 'Low Price' ||
            dataset.label === 'High Price' ||
            activeDatasets.includes(dataset.label)
          )
        })

      // Volume dataset
      const volumeDataset = activeDatasets.includes('Volume')
        ? [
            {
              label: 'Volume',
              data: filteredData.map((item) => item.Volume),
              backgroundColor: 'rgba(153, 102, 255, 0.6)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1,
              type: 'bar',
              yAxisID: 'y1'
            }
          ]
        : []

      chartData.value = {
        labels: filteredData.map((item) => formatChartDate(item.date)),
        datasets: [...priceDatasets, ...volumeDataset]
      }

      if (showMA.value) {
        updateMA()
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

    // Add these new refs
    const searchQuery = ref('')
    const stocks = ref<Stock[]>([
      { symbol: 'AAPL', name: 'Apple Inc.' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.' },
      { symbol: 'MSFT', name: 'Microsoft Corporation' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.' }
      // Add more stocks as needed
    ])

    const filteredStocks = computed(() => {
      const query = searchQuery.value.toLowerCase()
      return stocks.value.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query) || stock.name.toLowerCase().includes(query)
      )
    })

    const selectStock = (symbol: string) => {
      inputSymbol.value = symbol
      fetchData()
    }

    const updateElementId = () => {
      if (res.value) {
        const element = document.getElementById('abc')
        if (element) {
          element.innerHTML = res.value.companyName
        }
      }
    }

    const chartRef = ref(null)

    const resetZoom = () => {
      const chartInstance = chartRef.value?.__chartist__
      if (chartInstance) {
        chartInstance.resetZoom()
      }
    }

    const formatNumber = (num: number | string) => {
      if (typeof num === 'number') {
        return num.toLocaleString()
      }
      return num
    }

    // Add new refs for MA
    const maPeriod = ref(20)
    const showMA = ref(false)

    // Add MA calculation function
    const calculateMA = (data: number[], period: number) => {
      const result = Array(data.length).fill(null)
      let sum = 0
      
      // Calculate first MA value
      for (let i = 0; i < period && i < data.length; i++) {
        sum += data[i]
        if (i === period - 1) {
          result[0] = sum / period
        }
      }
    
      // Calculate remaining MA values using sliding window
      for (let i = 1; i < data.length - period + 1; i++) {
        sum = sum - data[i - 1] + data[i + period - 1]
        result[i] = sum / period
      }
    
      return result
    }

    // Add MA toggle function
    const toggleMA = () => {
      showMA.value = !showMA.value
      updateMA()
    }

    // Add MA update function
    const updateMA = () => {
      const maDatasetIndex = chartData.value.datasets.findIndex(ds => ds.label === `MA(${maPeriod.value})`)
      
      if (!showMA.value) {
        if (maDatasetIndex !== -1) {
          chartData.value.datasets.splice(maDatasetIndex, 1)
        }
        return
      }

      const filteredData = filterDataByTimeFrame(stockData.value)
      const closeValues = filteredData.map(item => item.Close)
      const maValues = calculateMA(closeValues, Number(maPeriod.value))

      const maDataset = {
        label: `MA(${maPeriod.value})`,
        data: maValues,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        fill: false,
        type: 'line' as const,
        pointStyle: false,
        yAxisID: 'y'
      }

      if (maDatasetIndex !== -1) {
        chartData.value.datasets[maDatasetIndex] = maDataset
      } else {
        chartData.value.datasets.push(maDataset)
      }
      
      chartUpdateTrigger.value++
    }

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
      additionalDatasets,
      res,
      searchQuery,
      filteredStocks,
      selectStock,
      profile,
      resetZoom,
      chartRef,
      formatNumber,
      maPeriod,
      showMA,
      toggleMA,
      updateMA
    }
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 600px;
  width: 100%;
  margin-bottom: 2rem;
}

/* Optional: Add a modifier class for even larger charts */
.large-chart {
  height: 90vh; /* Further increase height if needed */
}

.mt-4 {
  margin-top: 1.5rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.stock-info {
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
}

.stock-info p {
  margin: 0.5rem 0;
}

.v-card {
  height: 100%;
}

.v-list {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.ma-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
