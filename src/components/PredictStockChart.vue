<template>
  <div>
    <button @click="toggleChartType">
      Switch to {{ isBarChart ? 'Line' : 'Bar' }} Chart
    </button>
    <button @click="resetZoom">Reset Zoom</button> <!-- Add reset zoom button -->
    <button @click="resetChart">Reset Chart</button> <!-- Add reset chart button -->
    <component 
      :is="currentChartComponent" 
      v-if="chartData.labels.length > 0" 
      :data="chartData" 
      :options="options" 
      ref="chartRef" 
    />
    <p v-else>Loading data or no data available...</p>
    <div class="chart-space"></div> <!-- Add space after the chart -->
    <canvas ref="chartRef"></canvas>
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

const isBarChart = ref(false) // Default to Line chart
const chartRef = ref(null) // Reference to the chart component
const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Training',
      data: [],
      backgroundColor: 'rgba(54, 162, 235, 0.6)', // New color
      borderColor: 'rgba(54, 162, 235, 1)', // New color
      borderWidth: 1,
      pointStyle: false, // Disable point style
      fill: true
    },
    {
      label: 'Predictions',
      data: [],
      backgroundColor: 'rgba(255, 99, 132, 0.6)', // New color
      borderColor: 'rgba(255, 99, 132, 1)', // New color
      borderWidth: 1,
      pointStyle: false, // Disable point style
      fill: true
    },
    {
      label: 'Original Data',
      data: [],
      backgroundColor: 'rgba(75, 192, 192, 0.6)', // New color
      borderColor: 'rgba(75, 192, 192, 1)', // New color
      borderWidth: 1,
      pointStyle: false, // Disable point style
      fill: true
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
  },
  plugins: {
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
            const colors = tooltip.labelColors[i]
            const dataset = chart.data.datasets[i]

            const dataPoint = tooltip.dataPoints[i]

            innerHtml += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.1)">'
            innerHtml += `<td style="padding: 5px"><span style="display: inline-block; width: 10px; height: 10px; margin-right: 5px; background-color: ${colors.backgroundColor}; border: 2px solid ${colors.borderColor};"></span>`
            innerHtml += `${dataset.label}</td>`
            innerHtml += `<td style="padding: 5px; text-align: right">${dataPoint.formattedValue}</td>`
            innerHtml += '</tr>'
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
        scaleMode: 'xy',
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
    const response = await fetch(`/api/predict/simple?company=${company}&time_diff_value=${timeDiffValue}&model_type=${modelType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const newData = await response.json()
    console.log('API Response:', newData)

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

  const trainingDates = data.data.training?.Date || []
  const testingDates = data.data.testing?.Date || []

  const trainingValues = data.data.training?.actual_values || []
  const testingValues = data.data.testing?.actual_values || []
  const testingPredictions = data.data.testing?.predictions || []

  console.log("testingPredictions", testingPredictions)

  console.log('Updating chart data...')

  const dateFormatter = new Intl.DateTimeFormat()
  const formattedTrainingDates = trainingDates.map(date => {
    const parsedDate = new Date(date)
    return isNaN(parsedDate.getTime()) ? 'No Data' : dateFormatter.format(parsedDate)
  })
  const formattedTestingDates = testingDates.map(date => {
    const parsedDate = new Date(date)
    return isNaN(parsedDate.getTime()) ? 'No Data' : dateFormatter.format(parsedDate)
  })

  const totalLength = trainingValues.length + testingValues.length

  console.log('Total data length:', totalLength)

  if (totalLength > 0) {
    chartData.value.labels = formattedTrainingDates.concat(formattedTestingDates)
    chartData.value.datasets[0].data = trainingValues.concat(new Array(testingValues.length).fill('No Data'))
    chartData.value.datasets[1].data = new Array(trainingValues.length).fill('No Data').concat(testingValues)
    chartData.value.datasets[2].data = new Array(trainingValues.length).fill('No Data').concat(testingPredictions)
    console.log('Updated chart data:', chartData.value)
  } else {
    console.warn('Invalid array length detected')
  }
}

const resetZoom = () => {
  if (chartRef.value && chartRef.value.chartInstance) {
    chartRef.value.chartInstance.resetZoom()
  }
}

const resetChart = () => {
  fetchData()
  resetZoom()
}

// function createChart() {
//   const ctx = chartRef.value.getContext('2d')
//   chartInstance = new Chart(ctx, {
//     type: 'line',
//     data: {
//       // ...existing data...
//     },
//     options: {
//       // ...existing options...
//       plugins: {
//         zoom: {
//           zoom: {
//             wheel: {
//               enabled: true,
//             },
//             pinch: {
//               enabled: true,
//             },
//             mode: 'xy',
//           },
//         },
//       },
//     },
//   })
// }

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
</style>