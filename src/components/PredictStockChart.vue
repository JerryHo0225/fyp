<template>
  <div>
    <!-- Added chart type toggle button -->
    <button @click="toggleChartType" class="toggle-button">
      Switch to {{ isBarChart ? 'Line' : 'Bar' }} Chart
    </button>
    <div class="user-choices">
      <p>
        Company: {{ company }} | Time Difference Unit:
        {{ timeDiffValue === 'hours' ? 'Hours' : timeDiffValue }} | Model Type: {{ modelType }}
      </p>
      <p v-if="errorMetrics">MAE: {{ errorMetrics.MAE }} | RMSE: {{ errorMetrics.RMSE }}</p>
      <p v-if="credibility">
        Credibility Score: {{ credibility.score }} / 100 | Confidence Level:
        {{ credibility.confidence_level }} | Volatility Match: {{ credibility.volatility_match }} /
        100 | Metrics Quality: {{ credibility.metrics_quality }} / 100
      </p>
      <p v-if="futurePredictions">Future Predictions Count: {{ futurePredictions.count }} days</p>
      <button @click="resetZoom" class="toggle-button">Reset Zoom</button>
    </div>

    <component
      :is="currentChartComponent"
      v-if="chartData.labels.length > 0"
      :data="chartData"
      :options="options"
      ref="chartRef"
    />
    <p v-else-if="error">Failed to load data. Please try again.</p>
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading chart data...</p>
    </div>

    <!-- Separator and collapse controls -->
    <div class="chart-separator">
      <button @click="toggleSecondChart" class="toggle-button">
        {{ isSecondChartVisible ? 'Collapse' : 'Expand' }} Second Chart
      </button>
    </div>

    <!-- Second Chart with transition -->
    <transition name="fade">
      <div v-show="isSecondChartVisible" class="second-chart">
        <button @click="resetSecondZoom" class="toggle-button">Reset Second Chart Zoom</button>

        <component
          :is="currentChartComponent"
          v-if="secondChartData.labels.length > 0"
          :data="secondChartData"
          :options="secondOptions"
          ref="secondChartRef"
        />
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
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

const route = useRoute()
const company = route.query.company || 'AAPL'
const timeDiffValue = route.query.time_diff_value || 'hours'
const modelType = route.query.model_type || 'LinearRegression'
const year = route.query.year_value || 'LinearRegression'

const isBarChart = ref(false) // Default to Line chart
const chartRef = ref(null) // Reference to the chart component
const chartData = ref({
  labels: [],

  datasets: [
    {
      label: 'Training', // Blue dataset
      data: [],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      pointStyle: false,
      fill: true
    },
    {
      label: 'Original Data', // Purple dataset
      data: [],
      backgroundColor: 'rgba(255, 159, 64, 0.6)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1,
      pointStyle: false,
      fill: true
    },
    {
      label: 'Predictions', // Orange dataset
      data: [],
      backgroundColor: 'rgba(128, 0, 128, 0.6)',
      borderColor: 'rgba(128, 0, 128, 1)',
      borderWidth: 1,
      pointStyle: false,
      fill: true
    },
    {
      label: 'Future Predictions', // Green dataset
      data: [],
      backgroundColor: 'rgba(5, 92, 92, 0.6)',
      borderColor: 'rgba(5, 92, 92, 1)',
      borderWidth: 1,
      pointStyle: false,
      fill: true
    },
    // {
    //   label: 'Moving Average',
    //   data: [],
    //   backgroundColor: 'rgba(255, 99, 132, 0.6)',
    //   borderColor: 'rgba(255, 99, 132, 1)',
    //   borderWidth: 2,
    //   pointStyle: false,
    //   fill: false
    // }
  ]
})
const options = ref({
  responsive: true,
  scales: {
    y: {
      beginAtZero: false,
      title: {
        display: true,
        text: 'Predicted Values'
      }
    },
    x: {
      min: 0 // Will be updated after data load
    }
  },
  plugins: {
    zoom: {
      limits: {
        x: {
          minRange: 50
        }
      },
      pan: {
        enabled: true,
        mode: 'x',
        onPanStart: function ({ chart }) {
          const area = chart.chartArea
          return area
        }
      },
      zoom: {
        mode: 'x',
        onZoomStart: function ({ chart, event }) {
          const area = chart.chartArea
          const point = event
          return (
            point &&
            point.x >= area.left &&
            point.x <= area.right &&
            point.y >= area.top &&
            point.y <= area.bottom
          )
        }
      }
    },
    tooltip: {
      enabled: false,
      mode: 'index',
      intersect: false,
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
          const bodyLines = tooltip.body.map((b) => b.lines)

          let innerHtml = '<table>'
          innerHtml +=
            '<thead><tr><th colspan="2" style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px;">'
          innerHtml += titleLines[0]
          innerHtml += '</th></tr></thead><tbody>'

          bodyLines.forEach((body, i) => {
            const dataset = chart.data.datasets[i]
            if (dataset.label === 'Original Data') {
              const colors = chart.data.datasets[1]
              const dataPoint = tooltip.dataPoints[0]
              const colors1 = chart.data.datasets[2]
              const dataPoint1 = tooltip.dataPoints[1]
              const dataset1 = chart.data.datasets[2]
              innerHtml += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.1)">'
              innerHtml += `<td style="padding: 5px"><span style="display: inline-block; width: 10px; height: 10px; margin-right: 5px; background-color: ${colors.borderColor}; border: 2px solid ${colors.borderColor};"></span>`
              innerHtml += `${dataset.label}</td>`
              innerHtml += `<td style="padding: 5px; text-align: right">${dataPoint.formattedValue}</td>`
              innerHtml += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.1)">'
              innerHtml += `<td style="padding: 5px"><span style="display: inline-block; width: 10px; height: 10px; margin-right: 5px; background-color: ${colors1.borderColor}; border: 2px solid ${colors1.borderColor};"></span>`
              innerHtml += `${dataset1.label}</td>`
              innerHtml += `<td style="padding: 5px; text-align: right">${dataPoint1.formattedValue}</td>`
              innerHtml += '</tr>'
              innerHtml += '</tr>'
            }
          })

          if (tooltip.dataPoints && tooltip.dataPoints.length < 0) {
            const values = tooltip.dataPoints.map((p) => p.raw)
            const sum = values.reduce((a, b) => a + b, 0)
            const avg = sum / values.length
            const max = Math.max(...values)
            const min = Math.min(...values)

            innerHtml +=
              '<tr><td colspan="2" style="padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.3)">'
            innerHtml += `<div style="font-size: 0.9em; color: rgba(255,255,255,0.8)">`
            innerHtml += `<div>Sum: ${sum.toFixed(2)}</div>`
            innerHtml += `<div>Avg: ${avg.toFixed(2)}</div>`
            innerHtml += `<div>Max: ${max.toFixed(2)}</div>`
            innerHtml += `<div>Min: ${min.toFixed(2)}</div>`
            innerHtml += '</div></td></tr>'
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
    zoom: {
      onZoomStart: ({ chart, point }) => chart.isPointInArea(point),
      pan: {
        enabled: true,
        mode: 'xy',
        onPanComplete: () => {
          console.log('Pan completed')
        }
      },
      zoom: {
        wheel: {
          enabled: true
        },
        pinch: {
          enabled: true
        },
        scaleMode: 'xy'
      },
      limits: {
        y: { min: 0 }
      }
    }
  }
})

const secondChartRef = ref(null)
const secondChartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Training',
      data: [],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      pointStyle: false,
      fill: true
    },
    {
      label: 'Original Data',
      data: [],
      backgroundColor: 'rgba(128, 0, 128, 0.6)',
      borderColor: 'rgba(128, 0, 128, 1)',
      borderWidth: 1,
      pointStyle: false,
      fill: true
    },
    {
      label: 'Predictions',
      data: [],
      backgroundColor: 'rgba(255, 159, 64, 0.6)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1,
      pointStyle: false,
      fill: true
    },
    {
      label: 'Future Predictions',
      data: [],
      backgroundColor: 'rgba(5, 92, 92, 0.6)',
      borderColor: 'rgba(5, 92, 92, 1)',
      borderWidth: 1,
      pointStyle: false,
      fill: true
    }
  ]
})

const secondOptions = ref(JSON.parse(JSON.stringify(options.value)))
secondOptions.value.plugins.title.text = 'Second View of Stock Prices'
secondOptions.value.scales.x.min = 0

const currentChartComponent = computed(() => (isBarChart.value ? Bar : Line)) // Allow toggling chart type

const toggleChartType = () => {
  isBarChart.value = !isBarChart.value
}

const error = ref(false)
const errorMetrics = ref(null)
const credibility = ref(null)
const futurePredictions = ref(null)

const showTraining = ref(true)

const toggleTrainingData = () => {
  showTraining.value = !showTraining.value
  if (chartData.value.labels.length > 0) {
    if (!showTraining.value) {
      // Get the length of training data
      const trainingLength = chartData.value.datasets[0].data.filter((x) => x !== 'No Data').length

      // Remove training period from labels
      chartData.value.labels = chartData.value.labels.slice(trainingLength)

      // Only keep the non-'No Data' values for predictions and future predictions
      chartData.value.datasets[2].data = chartData.value.datasets[2].data.filter(
        (x) => x !== 'No Data'
      )
      chartData.value.datasets[3].data = chartData.value.datasets[3].data.filter(
        (x) => x !== 'No Data'
      )

      // Hide training and original data
      chartData.value.datasets[0].data = new Array(chartData.value.labels.length).fill('No Data')
      chartData.value.datasets[1].data = new Array(chartData.value.labels.length).fill('No Data')
    } else {
      // Fetch data again to restore original state
      fetchData()
    }
  }
}

const fetchData = async () => {
  try {
    console.log('Fetching data...')
    const response = await fetch(
      `/api/predict/train?company=${company}&time_diff_value=${timeDiffValue}&model_type=${modelType}&year_value=${year}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    if (response.status === 404) {
      error.value = true
      return
    }
    const newData = await response.json()
    console.log('API Response:', newData)

    updateChartData(newData)
    errorMetrics.value = newData.data.error_metrics
    credibility.value = newData.data.credibility
  } catch (error) {
    console.error('Error fetching data:', error)
    error.value = true
  }
}

const updateChartData = (data: any) => {
  if (!data) {
    console.warn('No data available to update chart')
    return
  }

  const trainingDates = data.data.training?.Date || []
  const testingDates = data.data.testing?.Date || []

  const trainingValues = data.data.training?.actual_values || []
  const testingValues = data.data.testing?.actual_values || []
  const testingPredictions = data.data.testing?.predictions || []

  console.log('testingPredictions', testingPredictions)
  console.log('Updating chart data...')

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(timeDiffValue === 'hours' && {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    })
  })

  const formattedTrainingDates = trainingDates.map((date) => {
    const parsedDate = new Date(date)
    return isNaN(parsedDate.getTime()) ? 'No Data' : dateFormatter.format(parsedDate)
  })
  const formattedTestingDates = testingDates.map((date) => {
    const parsedDate = new Date(date)
    return isNaN(parsedDate.getTime()) ? 'No Data' : dateFormatter.format(parsedDate)
  })

  const totalLength = trainingValues.length + testingValues.length

  console.log('Total data length:', totalLength)

  // Add future predictions
  const futureDates = data.data.future?.Date?.US || []
  const futurePredictionValues = data.data.future?.predictions || []
  futurePredictions.value = data.data.future

  const formattedFutureDates = futureDates.map((date) => {
    const parsedDate = new Date(date)
    return isNaN(parsedDate.getTime()) ? 'No Data' : dateFormatter.format(parsedDate)
  })

  if (totalLength > 0) {
    chartData.value.labels = formattedTrainingDates.concat(
      formattedTestingDates,
      formattedFutureDates
    )

    chartData.value.datasets[0].data = trainingValues.concat(
      new Array(testingValues.length).fill('No Data')
    )
    chartData.value.datasets[1].data = new Array(trainingValues.length-1)
      .fill('No Data')
      .concat(testingValues)
    chartData.value.datasets[2].data = new Array(trainingValues.length-1)
      .fill('No Data')
      .concat(testingPredictions)
    chartData.value.datasets[3].data = new Array(trainingValues.length + testingValues.length-2)
      .fill('No Data')
      .concat(futurePredictionValues)
    console.log('Updated chart data:', chartData.value)

    // Set initial x-axis range to start from training data end
    options.value.scales.x.min = 0.99 * trainingValues.length
    options.value.scales.x.max = totalLength + futurePredictionValues.length

    // Update Moving Average after chart data is updated
    //updateMovingAverage()

    // Update second chart with the same data
    secondChartData.value.labels = [...chartData.value.labels]
    secondChartData.value.datasets.forEach((dataset, index) => {
      dataset.data = [...chartData.value.datasets[index].data]
    })

    secondOptions.value.scales.x.min = 0
    secondOptions.value.scales.x.max = totalLength + futurePredictionValues.length
  } else {
    console.warn('Invalid array length detected')
  }
}

const resetZoom = () => {
  if (chartRef.value) {
    chartRef.value.chart.resetZoom()
  }
}

const resetSecondZoom = () => {
  if (secondChartRef.value) {
    secondChartRef.value.chart.resetZoom()
  }
}

const resetChart = () => {
  fetchData()
  resetZoom()
}

const maPeriod = ref(20)
const showMA = ref(true)

// const calculateMA = (data: number[], period: number) => {
//   const result = []
//   for (let i = 0; i < data.length; i++) {
//     if (i < period - 1) {
//       result.push('No Data')
//       continue
//     }
//     const slice = data.slice(i - period + 1, i + 1)
//     const validNumbers = slice.filter((n) => n !== 'No Data' && !isNaN(n))
//     if (validNumbers.length === period) {
//       const sum = validNumbers.reduce((a, b) => a + b, 0)
//       result.push(sum / period)
//     } else {
//       result.push('No Data')
//     }
//   }
//   return result
// }

// const updateMovingAverage = () => {
//   if (!showMA.value) return

//   // Combine all actual values (training and testing)
//   const allValues = [
//     ...chartData.value.datasets[0].data.filter((x) => x !== 'No Data'),
//     ...chartData.value.datasets[1].data.filter((x) => x !== 'No Data')
//   ]

//   // const maValues = calculateMA(allValues, Number(maPeriod.value))

//   // Align MA values with the chart data
//   const trainingLength = chartData.value.datasets[0].data.filter((x) => x !== 'No Data').length
//   //chartData.value.datasets[4].data = maValues
// }

// const toggleMA = () => {
//   showMA.value = !showMA.value
//   if (showMA.value) {
//     updateMovingAverage()
//   } else {
//     chartData.value.datasets[4].data = new Array(chartData.value.labels.length).fill('No Data')
//   }
// }

// Add new ref for collapse state
const isSecondChartVisible = ref(false)

const toggleSecondChart = () => {
  isSecondChartVisible.value = !isSecondChartVisible.value
}

onMounted(() => {
  console.log('Component mounted')
  fetchData()
  //createChart()
})
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
.chart-space {
  height: 50px; /* Adjust the height as needed */
}
.user-choices {
  margin-bottom: 20px;
  font-size: 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 200px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.toggle-button {
  padding: 8px 16px;
  margin: 5px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px; /* Add spacing between buttons */
}

.toggle-button:hover {
  background-color: #2980b9;
}

.ma-controls {
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.ma-controls input {
  width: 60px;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.chart-separator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  margin: 20px 0;
  border-bottom: 1px solid #eee;
}

.second-chart {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
