
<template>
  <div>
    <h1>Stock Symbols</h1>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <ul v-else>
      <li v-for="symbol in symbols" :key="symbol">{{ symbol }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

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

onMounted(fetchSymbols)
</script>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 5px 0;
  text-align: center;
}
</style>