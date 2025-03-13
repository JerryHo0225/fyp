<template>
  <div>
    <h1>Stock Recommendations</h1>
    <table class="recommendations-table">
      <thead>
        <tr>
          <th>Symbol</th>
          <th>SMA 50</th>
          <th>SMA 200</th>
          <th>RSI</th>
          <th>MACD</th>
          <th>Signal Line</th>
          <th>BB Position</th>
          <th>Volume Ratio</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="recommendation in recommendations" :key="recommendation.symbol">
          <td>{{ recommendation.symbol }}</td>
          <td>{{ recommendation.technical_indicators.sma_50 }}</td>
          <td>{{ recommendation.technical_indicators.sma_200 }}</td>
          <td>{{ recommendation.technical_indicators.rsi }}</td>
          <td>{{ recommendation.technical_indicators.macd }}</td>
          <td>{{ recommendation.technical_indicators.signal_line }}</td>
          <td>{{ recommendation.technical_indicators.bb_position }}</td>
          <td>{{ recommendation.technical_indicators.volume_ratio }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

interface Recommendation {
  symbol: string;
  technical_indicators: {
    sma_50: number;
    sma_200: number;
    rsi: number;
    macd: number;
    signal_line: number;
    bb_position: number;
    volume_ratio: number;
  };
}

export default defineComponent({
  name: 'StockRecommendations',
  setup() {
    const recommendations = ref<Recommendation[]>([]);

    onMounted(async () => {
      try {
        const response = await fetch('/api/stock-recommendations'); // Replace with your API endpoint
        const data = await response.json();
        recommendations.value = data.recommendations;
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    });

    return {
      recommendations,
    };
  },
});
</script>

<style scoped>
.recommendations-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.recommendations-table th,
.recommendations-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.recommendations-table th {
  background-color: #f2f2f2;
}
</style>
