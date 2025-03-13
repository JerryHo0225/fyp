<template>
      <NavBarView />
  <v-container>
    <v-card class="mb-5">
      <v-card-title class="headline">Stock Clusters Visualization</v-card-title>
      <v-card-text>
        <p>Visualize how stocks are clustered based on their features such as volatility, sector, and growth/value characteristics.</p>
        <v-btn color="primary" @click="fetchClusters" :loading="loading">
          <v-icon left>mdi-refresh</v-icon>
          Refresh Clusters
        </v-btn>
      </v-card-text>
    </v-card>

    <div v-if="clusters">
      <!-- Cluster Overview -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>Cluster Distribution</v-card-title>
            <v-card-text>
              <canvas ref="clusterDistributionChart" height="100"></canvas>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Cluster Details -->
      <v-row>
        <v-col v-for="(count, cluster) in clusters.cluster_counts" :key="cluster" cols="12" md="4" lg="3">
          <v-card class="mb-4">
            <v-card-title>
              Cluster {{ cluster }}
              <v-spacer></v-spacer>
              <v-chip color="primary" small>{{ count }} stocks</v-chip>
            </v-card-title>
            
            <v-card-subtitle>
              {{ clusters.cluster_names[cluster] || `Unnamed Cluster ${cluster}` }}
            </v-card-subtitle>
            
            <v-divider></v-divider>
            
            <v-card-text>
              <h3>Top Sectors</h3>
              <div v-for="sector in getTopSectorsForCluster(cluster)" :key="sector.name">
                {{ sector.name }}: {{ sector.count }}
              </div>
              
              <v-divider class="my-3"></v-divider>
              
              <h3>Sample Stocks</h3>
              <v-chip
                v-for="stock in getSampleStocksForCluster(cluster)"
                :key="stock.symbol"
                class="ma-1"
                :color="getSectorColor(stock.sector)"
                text-color="white"
                small
              >
                {{ stock.symbol }}
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Sector Distribution by Cluster -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>Sector Distribution by Cluster</v-card-title>
            <v-card-text>
              <v-data-table
                :headers="sectorHeaders"
                :items="clusters.cluster_sectors"
                :items-per-page="10"
                class="elevation-1"
              ></v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
    
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
import Chart from 'chart.js/auto';
import Footer from '@/components/Footer.vue';
import NavBarView from '@/components/NavBarView.vue';

export default {
  name: 'StockClusters',
  data() {
    return {
      loading: false,
      clusters: null,
      error: null,
      chart: null,
      sectorHeaders: [
        { text: 'Cluster', value: 'cluster' }
        // Other headers will be added dynamically
      ],
      sectorColors: {
        'Technology': 'indigo',
        'Healthcare': 'teal',
        'Financials': 'blue-grey',
        'Consumer Cyclical': 'deep-orange',
        'Communication Services': 'purple',
        'Industrials': 'blue',
        'Consumer Defensive': 'light-blue',
        'Utilities': 'green',
        'Energy': 'brown',
        'Real Estate': 'red',
        'Basic Materials': 'amber'
      }
    };
  },
  mounted() {
    this.fetchClusters();
  },
  methods: {
    async fetchClusters() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('/api/recommender/visualization/stock-clusters');
        
        if (response.data.status === 'success') {
          this.clusters = response.data;
          
          // Update sector headers dynamically
          if (this.clusters.cluster_sectors && this.clusters.cluster_sectors.length > 0) {
            const firstItem = this.clusters.cluster_sectors[0];
            this.sectorHeaders = [
              { text: 'Cluster', value: 'cluster' },
              ...Object.keys(firstItem)
                .filter(key => key !== 'cluster')
                .map(sector => ({ text: sector, value: sector }))
            ];
          }
          
          // Draw chart in the next tick when the canvas is available
          this.$nextTick(() => {
            this.drawClusterDistributionChart();
          });
        } else {
          this.error = response.data.message || 'Failed to fetch cluster data';
          this.clusters = null;
        }
      } catch (err) {
        this.error = err.response ? err.response.data.detail : err.message;
        console.error('Error fetching clusters:', err);
        this.clusters = null;
      } finally {
        this.loading = false;
      }
    },
    
    drawClusterDistributionChart() {
      if (!this.clusters || !this.$refs.clusterDistributionChart) return;
      
      // Destroy previous chart if it exists
      if (this.chart) {
        this.chart.destroy();
      }
      
      const ctx = this.$refs.clusterDistributionChart.getContext('2d');
      
      // Prepare data
      const labels = Object.keys(this.clusters.cluster_counts).map(cluster => 
        `Cluster ${cluster} - ${this.clusters.cluster_names[cluster] || 'Unnamed'}`
      );
      const data = Object.values(this.clusters.cluster_counts);
      
      // Generate colors
      const backgroundColors = labels.map((_, i) => 
        `hsl(${(i * 360 / labels.length) % 360}, 70%, 60%)`
      );
      
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Number of Stocks',
            data,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(color => color.replace('60%', '50%')),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Stocks'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Cluster'
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: 'Stock Distribution by Cluster'
            }
          }
        }
      });
    },
    
    getTopSectorsForCluster(cluster) {
      if (!this.clusters || !this.clusters.cluster_sectors) return [];
      
      const clusterData = this.clusters.cluster_sectors.find(item => item.cluster === parseInt(cluster));
      if (!clusterData) return [];
      
      // Convert to array of {name, count} objects and sort
      return Object.entries(clusterData)
        .filter(([key]) => key !== 'cluster')
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3); // Top 3 sectors
    },
    
    getSampleStocksForCluster(cluster) {
      if (!this.clusters || !this.clusters.cluster_samples) return [];
      return this.clusters.cluster_samples[cluster] || [];
    },
    
    getSectorColor(sector) {
      return this.sectorColors[sector] || 'grey';
    }
  }
};
</script>
