<template>
  <main>
    <div class="container">
      <div style="padding-top: 3rem"></div>

      <div v-if="stockData.length">
        <h2>Stock Information</h2>
        <ul>
          <li v-for="stock in stockData" :key="stock.Date">
            <strong>Stock Symbol:</strong> {{ stock.Symbol }}<br />
            <strong>Open Price:</strong> {{ stock.Open }}<br />
            <strong>Close Price:</strong> {{ stock.Close }}<br />
            <strong>Volume:</strong> {{ stock.Volume }}<br />
            <strong>Date:</strong> {{ stock.Date }}<br />
            <hr />
          </li>
        </ul>
        <button @click="loadMore">Load More</button>

        <!-- Line Chart -->
        <StockChart></StockChart>
      </div>
      <div v-else>
        <p>Loading data...</p>
      </div>
    </div>
  </main>
</template>



<script setup>

import { ref, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import StockChart from '@/components/StockChart.vue';

const stockData = ref([])
const lineChartRef = ref(null) // Reference for the chart
let chartInstance = null // Store chart instance
let skip = ref(0)
const limit = 100 // Number of records to fetch per request

const fetchData = async () => {
  try {
    const response = await fetch(`/api/stocks`)
    const newData = await response.json()
    console.log('API Response:', newData) // Log the response

    // Check if newData is an array or extract the data if it's an object
    if (Array.isArray(newData)) {
      stockData.value.push(...newData)
    } else if (newData.data && Array.isArray(newData.data)) {
      stockData.value.push(...newData.data)
    } else {
      console.error('Fetched data is not in expected format:', newData)
      return // Exit if data format is not as expected
    }

    skip.value += limit // Update skip for next request
    await nextTick(); // Ensure DOM updates before updating the chart
    } catch (error) {
    console.log('Error fetching data:', error)
  }
}

const loadMore = () => {
  fetchData()
}

// Function to update the chart

onMounted(() => {
  fetchData()
})

</script>

<style>
.container {
  max-width: 800px;
  margin: auto;
}
canvas {
  max-width: 100%;
  height: 400px; /* Ensure the height is set */
}
</style>