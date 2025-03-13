<template>
      <NavBarView />
  <v-container>
    <v-card>
      <v-card-title class="headline">
        All Stocks in Recommender System
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="stocks"
          :search="search"
          :loading="loading"
          :items-per-page="10"
          class="elevation-1"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Total Stocks: {{ stocks.length }}</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="fetchStocks">
                <v-icon left>mdi-refresh</v-icon>
                Refresh
              </v-btn>
            </v-toolbar>
          </template>
          
          <template v-slot:item.volatility="{ item }">
            <v-chip
              :color="getVolatilityColor(item.volatility)"
              dark
              small
            >
              {{ item.volatility }}
            </v-chip>
          </template>
          
          <template v-slot:item.growth_value="{ item }">
            <v-chip
              :color="getStyleColor(item.growth_value)"
              dark
              small
            >
              {{ item.growth_value }}
            </v-chip>
          </template>
          
          <template v-slot:item.cluster="{ item }">
            <v-chip color="primary" dark small>
              {{ item.cluster }}
            </v-chip>
          </template>
        </v-data-table>
      </v-card-text>
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

</script>
<script>
import axios from 'axios';
import NavBarView from '@/components/NavBarView.vue';
import Footer from '@/components/Footer.vue';

export default {
  name: 'RecommenderStocks',
  data() {
    return {
      loading: false,
      stocks: [],
      search: '',
      error: null,
      headers: [
        { text: 'Symbol', value: 'symbol' },
        { text: 'Name', value: 'name' },
        { text: 'Sector', value: 'sector' },
        { text: 'Volatility', value: 'volatility' },
        { text: 'Growth/Value', value: 'growth_value' },
        { text: 'Cluster', value: 'cluster' }
      ]
    };
  },
  created() {
    this.fetchStocks();
  },
  methods: {
    async fetchStocks() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('/api/recommender/stocks');
        
        if (response.data.status === 'success') {
          this.stocks = response.data.stocks;
        } else {
          this.error = response.data.message || 'Failed to fetch stocks';
          this.stocks = [];
        }
      } catch (err) {
        this.error = err.response ? err.response.data.detail : err.message;
        console.error('Error fetching stocks:', err);
        this.stocks = [];
      } finally {
        this.loading = false;
      }
    },
    
    getVolatilityColor(volatility) {
      const colors = {
        'low': 'green',
        'medium': 'orange',
        'high': 'red'
      };
      return colors[volatility.toLowerCase()] || 'grey';
    },
    
    getStyleColor(style) {
      const colors = {
        'growth': 'purple',
        'blend': 'blue',
        'value': 'teal'
      };
      return colors[style.toLowerCase()] || 'grey';
    }
  }
};
</script>