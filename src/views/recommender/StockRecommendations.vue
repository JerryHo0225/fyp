<template>
      <NavBarView />
  <v-container>
    <v-card class="mb-5">
      <v-card-title class="headline">Stock Recommendations</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="getRecommendations">
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="userId"
                label="User ID"
                type="number"
                required
                :rules="[v => !!v || 'User ID is required']"
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-select
                v-model="model"
                :items="modelOptions"
                item-title="text"
                item-value="value"
                label="Recommendation Model"
                required
              ></v-select>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-text-field
                v-model="count"
                label="Number of Recommendations"
                type="number"
                min="1"
                max="20"
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-select
                v-model="sectorFilter"
                :items="sectorOptions"
                label="Sector Filter"
                clearable
              ></v-select>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-select
                v-model="volatilityFilter"
                :items="volatilityOptions"
                item-title="text"
                item-value="value"
                label="Volatility Filter"
                clearable
              ></v-select>
            </v-col>
            
            <v-col cols="12">
              <v-btn color="primary" type="submit" :loading="loading">
                Get Recommendations
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card v-if="recommendations && recommendations.length > 0">
      <v-card-title>Recommended Stocks</v-card-title>
      <v-card-subtitle>Model: {{ recommendations_model }}</v-card-subtitle>
      <v-data-table
        v-if="recommendations && recommendations.length > 0"
        :headers="headers"
        :items="recommendations"
        :items-per-page="10"
        class="elevation-1"
        :loading="forecastsLoading"
      >
        <template v-slot:item.predicted_rating="{ item }">
          <template v-if="isValidRating(item?.raw?.predicted_rating || item?.predicted_rating)">
            <div class="flex-container" style="display: flex; align-items: center;">
              <v-rating
                :model-value="Number(item?.raw?.predicted_rating || item?.predicted_rating)"
                length="5"
                readonly
                size="small"
                color="amber"
                half-increments
              ></v-rating> <div>-</div>
              <!-- Pass stock-specific forecast data with loading indicator -->
              <div v-if="forecastsLoading" class="loading-indicator">
                <v-progress-circular size="20" width="2" indeterminate color="primary"></v-progress-circular>
              </div>
              <ForecastMiniChart 
                :data="stockForecasts[(item?.raw?.symbol || item?.symbol)]" 
                v-else-if="stockForecasts[(item?.raw?.symbol || item?.symbol)]" 
              />
            </div>
            <span class="ml-2">
              {{ parseFloat(item?.raw?.predicted_rating || item?.predicted_rating).toFixed(1) }}
            </span>
          </template>
          <span v-else>No rating available</span>
        </template>
        <template v-slot:item.stock_symbol="{ item }">
          {{ (item?.raw?.symbol || item?.raw?.stock_symbol || item?.symbol || item?.stock_symbol || 'N/A') }}
        </template>
      </v-data-table>
      <v-alert v-else type="info">Loading recommendations or no data available...</v-alert>
    </v-card>
    
    
    <v-alert 
      v-if="error" 
      type="error" 
      class="mt-4"
      dismissible
    >
      {{ error }}
    </v-alert>
  </v-container>
  <Footer />
</template>
<script setup>
import Footer from '@/components/Footer.vue';
import NavBarView from '@/components/NavBarView.vue';
import RecommenderNav from '@/components/RecommenderNav.vue';
import ForecastMiniChart from '@/components/Forecastminichart.vue';

</script>
<script>
import axios from 'axios';
import NavBarView from '@/components/NavBarView.vue';
import Footer from '@/components/Footer.vue';

export default {
  name: 'StockRecommendations',
  data() {
    return {
      loading: false,
      forecastsLoading: false, // Added separate loading state for forecasts
      userId: 1,
      model: 'svd',
      count: 5,
      sectorFilter: null,
      volatilityFilter: null,
      recommendations: [],
      recommendations_model: '',
      error: null,
      forecastData: null, // Added state to hold forecast data
      stockForecasts: {}, // Added to store forecasts for each stock symbol
      itemsPerPage: 10, // Default value matching v-data-table
      currentPage: 1,   // Track current page for batched loading
      headers: [
        { text: 'Symbol', value: 'symbol' },
        { text: 'Name', value: 'name' },
        { text: 'Sector', value: 'sector' },
        { text: 'Predicted Rating', value: 'predicted_rating' },
        { text: 'Volatility', value: 'volatility' },
        { text: 'Style', value: 'growth_value' }
      ],
      modelOptions: [
        { text: 'SVD - Collaborative Filtering', value: 'svd' },
        { text: 'KNN - Nearest Neighbor', value: 'knn' },
        { text: 'Clustering Based', value: 'cluster' }
      ],
      sectorOptions: [
        'Technology',
        'Healthcare',
        'Financials',
        'Consumer Cyclical',
        'Communication Services',
        'Industrials',
        'Consumer Defensive',
        'Utilities',
        'Energy',
        'Real Estate',
        'Basic Materials'
      ],
      volatilityOptions: [
        { text: 'High Volatility', value: 'high' },
        { text: 'Medium Volatility', value: 'medium' },
        { text: 'Low Volatility', value: 'low' }
      ]
    };
  },
  methods: {
    async getRecommendations() {
      this.loading = true;
      this.error = null;
      this.stockForecasts = {}; // Clear previous forecasts
      
      try {
        const params = {
          user_id: this.userId,
          n: this.count,
          model: this.model
        };
        
        if (this.sectorFilter) {
          params.sector_filter = this.sectorFilter;
        }
        
        if (this.volatilityFilter) {
          params.volatility_filter = this.volatilityFilter;
        }
        
        const response = await axios.get('/api/recommendations', { params });
        
        if (response.data.status === 'success') {
          // Process recommendations to handle NaN values
          this.recommendations = this.processRecommendations(response.data.recommendations);
          this.recommendations_model = response.data.model;
          
          // Complete loading for recommendations display
          this.loading = false;
          
          // Now start loading forecasts (after recommendations are displayed)
          this.forecastsLoading = true;
          await this.fetchStockForecasts(this.recommendations);
          this.forecastsLoading = false;
        } else {
          this.error = response.data.message || 'Failed to get recommendations';
          this.recommendations = [];
          this.loading = false;
        }
      } catch (err) {
        this.error = err.response ? err.response.data.detail : err.message;
        console.error('Error getting recommendations:', err);
        this.recommendations = [];
        this.loading = false;
      }
    },
    
    async fetchStockForecasts(recommendations) {
      try {
        if (!recommendations || recommendations.length === 0) return;
        
        // Calculate visible items first
        const startIndex = 0;
        const endIndex = Math.min(this.itemsPerPage, recommendations.length);
        
        // First batch: Load only visible items (first page)
        await this.fetchBatchForecasts(recommendations, startIndex, endIndex);
        
        // Update UI after first batch
        this.$forceUpdate();
        
        // Then load the rest in the background
        if (endIndex < recommendations.length) {
          // Continue loading remaining items without blocking UI
          this.fetchBatchForecasts(recommendations, endIndex, recommendations.length);
        }
        
      } catch (err) {
        console.error('Error fetching stock forecasts:', err);
      }
    },
    
    async fetchBatchForecasts(recommendations, startIndex, endIndex) {
      // Process a batch of recommendations
      for (let i = startIndex; i < endIndex; i++) {
        const stock = recommendations[i];
        const symbol = stock.symbol || stock.stock_symbol;
        
        if (!symbol) continue;
        
        try {
          const response = await axios.post(`/api/predict/week?company=${symbol}`);
          if (response.data) {
            this.stockForecasts[symbol] = response.data;
            
            // If this is visible batch, update UI more frequently
            if (i < this.itemsPerPage) {
              // Force component update every few items to show progress
              if (i % 3 === 0) this.$forceUpdate();
            }
            
            // Small delay to prevent API rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (err) {
          console.error(`Error fetching forecast for ${symbol}:`, err);
        }
      }
      
      console.log(`Batch forecasts loaded (${startIndex}-${endIndex}):`, 
                  Object.keys(this.stockForecasts).length);
    },
    
    processRecommendations(recommendations) {
      if (!recommendations || !Array.isArray(recommendations)) {
        return [];
      }
      
      return recommendations.map(item => {
        // Create a new object to avoid modifying the original
        const processedItem = { ...item };
        
        // Replace NaN values with a default value (e.g., null)
        if (!processedItem.predicted_rating || isNaN(Number(processedItem.predicted_rating))) {
          processedItem.predicted_rating = null;
        }
        
        return processedItem;
      });
    },
    
    isValidRating(rating) {
      return rating !== null && rating !== undefined && !isNaN(Number(rating));
    }
  }
};
</script>

<style scoped>
.loading-indicator {
  width: 20px;
  margin-left: 10px;
}
</style>
