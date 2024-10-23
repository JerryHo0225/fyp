<template>
  <div class="container" style="padding: 50px 0 100px 0">
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
    const router = useRouter(); // Access the router instance

    const fetchData = async () => {
      error.value = '';
      message.value = '';

      if (!inputSymbol.value) {
        error.value = 'Please enter a stock symbol.';
        return;
      }

      // Redirect to the viewchart route
      router.push(`/viewchart/${inputSymbol.value}`);
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