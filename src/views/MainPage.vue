<template>
  <main>
    <div class="container">
      <div style="padding-top: 3rem"></div>

      <div v-if="stockData.length">
        <h2>Stock Information</h2>
        <ul>
          <li v-for="stock in stockData" :key="stock.date">
            <strong>Stock Symbol:</strong> {{ stock.stock_symbol }}<br>
            <strong>Open Price:</strong> {{ stock.open_price }}<br>
            <strong>Close Price:</strong> {{ stock.close_price }}<br>
            <strong>Volume:</strong> {{ stock.volume }}<br>
            <strong>Current Price:</strong> {{ stock.current_price }}<br>
            <strong>Date:</strong> {{ stock.date }}<br>
            <hr/>
          </li>
        </ul>
        <button @click="loadMore">Load More</button>
      </div>
      <div v-else>
        <p>Loading data...</p>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stockData = ref([]) 
let skip = ref(0)
const limit = 100 // Number of records to fetch per request

const fetchData = async () => {
  try {
    const response = await fetch(`http://localhost:8000/stocks`);
    
    if (!response.ok) {
      const errorDetails = await response.text(); 
      throw new Error(`Network response was not ok: ${response.status} ${errorDetails}`);
    }
    
    const newData = await response.json();
    stockData.value.push(...newData); // Append new data
    skip.value += limit; // Update skip for next request
    
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

const loadMore = () => {
  fetchData();
}

onMounted(() => {
  fetchData();
})
</script>