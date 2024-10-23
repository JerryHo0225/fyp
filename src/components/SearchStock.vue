<template>
  <div class="search-container">
    <h1>Stock Search</h1>
    <input 
      v-model="inputSymbol" 
      @keyup.enter="fetchData" 
      placeholder="Enter stock symbol" 
    />
    <button @click="fetchData">Fetch Data</button>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'SearchStock',
  setup() {
    const inputSymbol = ref('');
    const message = ref('');
    const error = ref('');
    const router = useRouter(); // Use the router

    const fetchData = async () => {
      error.value = '';
      message.value = '';

      if (!inputSymbol.value) {
        error.value = 'Please enter a stock symbol.';
        return;
      }

      try {
        const response = await fetch(`/api/stocks/${inputSymbol.value}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        message.value = `Fetched data for: ${inputSymbol.value}`;
        console.log(data);

        // Redirect to the viewchart route
        router.push(`/viewchart/${inputSymbol.value}`);
      } catch (err) {
        error.value = `Error fetching data: ${err.message}`;
      }
    };

    return {
      inputSymbol,
      fetchData,
      message,
      error
    };
  }
};
</script>

<style scoped>
.search-container {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}

input {
  padding: 10px;
  margin-right: 10px;
  width: calc(100% - 120px);
}

button {
  padding: 10px;
}

.error {
  color: red;
}

.message {
  color: green;
}
</style>