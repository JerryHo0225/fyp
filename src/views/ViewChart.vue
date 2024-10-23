<template>
  <main>
    <NavBarView/>
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
      </div>
      <div v-else>
        <input 
          v-model="initialSymbol" 
          @keyup.enter="updateChart" 
          placeholder="Enter stock symbol" 
        />
        <MoreStockChart :initialSymbol="initialSymbol"></MoreStockChart>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import MoreStockChart from '@/components/MoreStockChart.vue';
import NavBarView from '@/components/NavBarView.vue';
import { useRoute } from 'vue-router'

const stockData = ref([]);
const route = useRoute()
const initialSymbol = ref(route.params.initialSymbol); // Initial stock symbol

const updateChart = () => {
  // Trigger any additional logic needed when the chart updates
  console.log(`Chart updated for symbol: ${this.$route.params.initialSymbol.value}`);
};



// Function to load more stock data (if needed)
// const loadMore = () => {
//   fetchData();
// };

// Fetch initial data on mounted
onMounted(() => {
  // Assuming fetchData is defined
  // fetchData();
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