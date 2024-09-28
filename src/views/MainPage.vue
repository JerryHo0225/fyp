<template>
  <main>
    <div class="container">
      <div style="padding-top: 3rem"></div>

      <div v-if="stockData.length">
        <h2>Stock Information</h2>
        <ul>
          <li v-for="stock in stockData" :key="stock.Date">
            <strong>Stock Symbol:</strong> {{ stock.Symbol }}<br>
            <strong>Open Price:</strong> {{ stock.Open }}<br>
            <strong>Close Price:</strong> {{ stock.Close }}<br>
            <strong>Volume:</strong> {{ stock.Volume }}<br>
            <strong>Date:</strong> {{ stock.Date }}<br>
            <hr/>
          </li>
        </ul>
        <button @click="loadMore">Load More</button>

        <!-- Line Chart -->
        <canvas ref="lineChart"></canvas>
      </div>
      <div v-else>
        <p>Loading data...</p>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const stockData = ref([]);
const lineChartRef = ref(null); // Reference for the chart
let chartInstance = null; // Store chart instance
let skip = ref(0);
const limit = 100; // Number of records to fetch per request

const fetchData = async () => {
  try {
    const response = await fetch(`/api/stocks`);
    const newData = await response.json();
    console.log('API Response:', newData); // Log the response

    // Check if newData is an array or extract the data if it's an object
    if (Array.isArray(newData)) {
      stockData.value.push(...newData);
    } else if (newData.data && Array.isArray(newData.data)) {
      stockData.value.push(...newData.data);
    } else {
      console.error('Fetched data is not in expected format:', newData);
      return; // Exit if data format is not as expected
    }

    skip.value += limit; // Update skip for next request
    updateChart(); // Update chart with new data
  } catch (error) {
    console.log('Error fetching data:', error);
  }
};

const loadMore = () => {
  fetchData();
}

// Function to update the chart
const updateChart = () => {
  console.log('Stock Data for Chart:', stockData.value); // Log stock data being used
  if (lineChartRef.value) {
    if (chartInstance) {
      chartInstance.destroy(); // Destroy previous instance
    }

    const labels = stockData.value.map(stock => stock.Date); // Ensure correct casing
    const data = stockData.value.map(stock => stock.Close); // Ensure correct casing

    console.log('Labels:', labels);
    console.log('Data:', data);

    // Check if data is populated
    if (labels.length === 0 || data.length === 0) {
      console.error('No data to display on the chart.');
      return;
    }

    chartInstance = new Chart(lineChartRef.value, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Close Price',
          data: data,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Price'
            }
          }
        }
      }
    });
  }
};

onMounted(() => {
  fetchData();
});

// Watch for changes in stockData to update the chart
watch(stockData, () => {
  updateChart();
});
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