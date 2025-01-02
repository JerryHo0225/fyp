<template>
  <div class="page-wrapper">
    <NavBarView />
    <main class="content">
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
          <MoreStockChart :initialSymbol="initialSymbol"></MoreStockChart>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MoreStockChart from '@/components/MoreStockChart.vue'
import NavBarView from '@/components/NavBarView.vue'
import { useRoute } from 'vue-router'
import Footer from '@/components/Footer.vue'

const stockData = ref([])
const route = useRoute()
const initialSymbol = ref(route.params.initialSymbol) // Initial stock symbol

const loadMore = () => {
  // Your load more logic
}

onMounted(() => {
  // Fetch initial data
})
</script>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
}

.container {
 
  margin: auto;
}

canvas {
  max-width: 100%;
  height: 400px;
}
</style>
