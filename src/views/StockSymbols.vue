<template>
  <div>
    <NavBarView />
    <div class="content">
      <h1>Stock Symbols</h1>
      <div v-if="isLoading">Loading...</div>
      <div v-else-if="error">{{ error }}</div>
      <div v-else class="grid-container">
        <div v-for="(symbols, letter) in groupedSymbols" :key="letter" class="grid-item">
          <h2>{{ letter }}</h2>
          <ul>
            <li v-for="symbol in symbols.slice(0, 20)" :key="symbol">
              <router-link :to="`/viewchart/${symbol}`">{{ symbol }}</router-link>

              
            </li>
          </ul>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavBarView from '@/components/NavBarView.vue'
import Footer from '@/components/Footer.vue'

const symbols = ref([])
const isLoading = ref(true)
const error = ref(null)

const fetchSymbols = async () => {
  try {
    const response = await fetch('/api/stocks/symbols/all')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    symbols.value = data.symbols
  } catch (err) {
    error.value = `Error fetching symbols: ${err.message}`
  } finally {
    isLoading.value = false
  }
}

const groupedSymbols = computed(() => {
  return symbols.value.reduce((acc, symbol) => {
    const firstLetter = symbol[0].toUpperCase()
    if (!acc[firstLetter]) {
      acc[firstLetter] = []
    }
    acc[firstLetter].push(symbol)
    return acc
  }, {})
})

onMounted(fetchSymbols)
</script>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 20px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.grid-item {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 3px 0;
}

.content {
  padding: 20px;
  flex: 1;
}
</style>