<template>
      <NavBarView />
  <v-container>
    <v-card class="mb-5">
      <v-card-title class="headline">User Clusters Visualization</v-card-title>
      <v-card-text>
        <p>Visualize how users are clustered based on their investment preferences and behaviors.</p>
        <v-btn color="primary" @click="fetchClusters" :loading="loading">
          <v-icon left>mdi-refresh</v-icon>
          Refresh Clusters
        </v-btn>
      </v-card-text>
    </v-card>

    <div v-if="clusters">
      <!-- Cluster Overview -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>User Cluster Distribution</v-card-title>
            <v-card-text>
              <canvas ref="clusterDistributionChart" height="250"></canvas>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>User Clusters Overview</v-card-title>
            <v-card-text>
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th>Cluster</th>
                      <th>Users</th>
                      <th>Main Risk Profile</th>
                      <th>Main Investment Horizon</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(count, cluster) in clusters.cluster_counts" :key="cluster">
                      <td>{{ cluster }}</td>
                      <td>{{ count }}</td>
                      <td>{{ getMainRiskProfile(cluster) }}</td>
                      <td>{{ getMainInvestmentHorizon(cluster) }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Risk Distribution -->
      <v-row class="mt-4">
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Risk Tolerance by Cluster</v-card-title>
            <v-card-text>
              <canvas ref="riskDistributionChart" height="250"></canvas>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Investment Horizon by Cluster</v-card-title>
            <v-card-text>
              <canvas ref="horizonDistributionChart" height="250"></canvas>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Sample Users from Each Cluster -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>Sample Users from Each Cluster</v-card-title>
            <v-card-text>
              <v-tabs
                v-model="activeCluster"
                background-color="primary"
                dark
                show-arrows
              >
                <v-tab
                  v-for="(_, cluster) in clusters.cluster_samples"
                  :key="cluster"
                >
                  Cluster {{ cluster }}
                </v-tab>
              </v-tabs>
              
              <v-tabs-items v-model="activeCluster">
                <v-tab-item
                  v-for="(users, cluster) in clusters.cluster_samples"
                  :key="cluster"
                >
                  <v-data-table
                    :headers="sampleUserHeaders"
                    :items="users"
                    :items-per-page="5"
                    class="elevation-1"
                  >
                    <template v-slot:item.risk_tolerance="{ item }">
                      <v-chip
                        :color="getRiskColor(item.risk_tolerance)"
                        dark
                        small
                      >
                        {{ item.risk_tolerance }}
                      </v-chip>
                    </template>
                    
                    <template v-slot:item.investment_horizon="{ item }">
                      <v-chip
                        :color="getHorizonColor(item.investment_horizon)"
                        dark
                        small
                      >
                        {{ item.investment_horizon }}
                      </v-chip>
                    </template>
                  </v-data-table>
                </v-tab-item>
              </v-tabs-items>
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
  name: 'UserClusters',
  data() {
    return {
      loading: false,
      clusters: null,
      error: null,
      charts: {},
      activeCluster: null,
      sampleUserHeaders: [
        { text: 'User ID', value: 'user_id' },
        { text: 'Risk Tolerance', value: 'risk_tolerance' },
        { text: 'Investment Horizon', value: 'investment_horizon' }
      ]
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
        const response = await axios.get('/api/recommender/visualization/user-clusters');
        
        if (response.data.status === 'success') {
          this.clusters = response.data;
          
          // Draw charts in the next tick when the canvas is available
          this.$nextTick(() => {
            this.drawCharts();
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
    
    drawCharts() {
      this.drawClusterDistributionChart();
      this.drawRiskDistributionChart();
      this.drawHorizonDistributionChart();
    },
    
    drawClusterDistributionChart() {
      if (!this.clusters || !this.$refs.clusterDistributionChart) return;
      
      // Destroy previous chart if it exists
      if (this.charts.clusterDistribution) {
        this.charts.clusterDistribution.destroy();
      }
      
      const ctx = this.$refs.clusterDistributionChart.getContext('2d');
      
      // Prepare data
      const labels = Object.keys(this.clusters.cluster_counts).map(cluster => `Cluster ${cluster}`);
      const data = Object.values(this.clusters.cluster_counts);
      
      // Generate colors
      const backgroundColors = labels.map((_, i) => 
        `hsl(${(i * 360 / labels.length) % 360}, 70%, 60%)`
      );
      
      this.charts.clusterDistribution = new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: backgroundColors,
            borderColor: 'white',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            },
            title: {
              display: true,
              text: 'User Distribution by Cluster'
            }
          }
        }
      });
    },
    
    drawRiskDistributionChart() {
      if (!this.clusters || !this.$refs.riskDistributionChart || !this.clusters.risk_distribution) return;
      
      // Destroy previous chart if it exists
      if (this.charts.riskDistribution) {
        this.charts.riskDistribution.destroy();
      }
      
      const ctx = this.$refs.riskDistributionChart.getContext('2d');
      
      // Prepare data
      const clusters = this.clusters.risk_distribution.map(item => `Cluster ${item.cluster}`);
      
      // Get unique risk levels
      const riskLevels = Array.from(new Set(
        this.clusters.risk_distribution.flatMap(item => 
          Object.keys(item).filter(key => key !== 'cluster')
        )
      ));
      
      // Prepare datasets
      const datasets = riskLevels.map((risk, index) => {
        const color = this.getRiskColor(risk);
        return {
          label: risk,
          data: this.clusters.risk_distribution.map(item => item[risk] || 0),
          backgroundColor: `${color}`,
          borderColor: `${color}`,
          borderWidth: 1
        };
      });
      
      this.charts.riskDistribution = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: clusters,
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              stacked: true,
              title: {
                display: true,
                text: 'Cluster'
              }
            },
            y: {
              stacked: true,
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Users'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Risk Tolerance Distribution by Cluster'
            }
          }
        }
      });
    },
    
    drawHorizonDistributionChart() {
      if (!this.clusters || !this.$refs.horizonDistributionChart || !this.clusters.horizon_distribution) return;
      
      // Destroy previous chart if it exists
      if (this.charts.horizonDistribution) {
        this.charts.horizonDistribution.destroy();
      }
      
      const ctx = this.$refs.horizonDistributionChart.getContext('2d');
      
      // Prepare data
      const clusters = this.clusters.horizon_distribution.map(item => `Cluster ${item.cluster}`);
      
      // Get unique horizon levels
      const horizonLevels = Array.from(new Set(
        this.clusters.horizon_distribution.flatMap(item => 
          Object.keys(item).filter(key => key !== 'cluster')
        )
      ));
      
      // Prepare datasets
      const datasets = horizonLevels.map((horizon, index) => {
        const color = this.getHorizonColor(horizon);
        return {
          label: horizon,
          data: this.clusters.horizon_distribution.map(item => item[horizon] || 0),
          backgroundColor: `${color}`,
          borderColor: `${color}`,
          borderWidth: 1
        };
      });
      
      this.charts.horizonDistribution = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: clusters,
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              stacked: true,
              title: {
                display: true,
                text: 'Cluster'
              }
            },
            y: {
              stacked: true,
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Users'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Investment Horizon Distribution by Cluster'
            }
          }
        }
      });
    },
    
    getMainRiskProfile(cluster) {
      if (!this.clusters || !this.clusters.risk_distribution) return 'Unknown';
      
      const clusterData = this.clusters.risk_distribution.find(item => item.cluster === parseInt(cluster));
      if (!clusterData) return 'Unknown';
      
      let maxCount = 0;
      let mainRisk = 'Unknown';
      
      Object.entries(clusterData).forEach(([key, count]) => {
        if (key !== 'cluster' && count > maxCount) {
          maxCount = count;
          mainRisk = key;
        }
      });
      
      return mainRisk;
    },
    
    getMainInvestmentHorizon(cluster) {
      if (!this.clusters || !this.clusters.horizon_distribution) return 'Unknown';
      
      const clusterData = this.clusters.horizon_distribution.find(item => item.cluster === parseInt(cluster));
      if (!clusterData) return 'Unknown';
      
      let maxCount = 0;
      let mainHorizon = 'Unknown';
      
      Object.entries(clusterData).forEach(([key, count]) => {
        if (key !== 'cluster' && count > maxCount) {
          maxCount = count;
          mainHorizon = key;
        }
      });
      
      return mainHorizon;
    },
    
    getRiskColor(risk) {
      const colors = {
        'low': 'green',
        'medium': 'orange',
        'high': 'red'
      };
      return colors[risk.toLowerCase()] || 'grey';
    },
    
    getHorizonColor(horizon) {
      const colors = {
        'short': 'blue-grey',
        'medium': 'indigo',
        'long': 'deep-purple'
      };
      return colors[horizon.toLowerCase()] || 'grey';
    }
  }
};
</script>