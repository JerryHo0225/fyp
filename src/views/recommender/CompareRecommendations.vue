<template>
  <NavBarView />
  <v-container>
    <v-card class="mb-5">
      <v-card-title class="headline">Compare Recommendation Algorithms</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="compareRecommendations">
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="userId"
                label="User ID"
                type="number"
                required
                :rules="[v => !!v || 'User ID is required']"
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="4">
              <v-text-field
                v-model="count"
                label="Number of Recommendations"
                type="number"
                min="1"
                max="20"
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="4">
              <v-btn color="primary" type="submit" :loading="loading">
                Compare Algorithms
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <div v-if="comparison">
      <v-row>
        <v-col cols="12">
          <v-alert
            type="info"
            border="left"
            colored-border
            elevation="2"
            class="mb-4"
          >
            <div>
              <strong>Common recommendations across models:</strong>
              <ul>
                <li><strong>SVD & KNN:</strong> {{ formatSymbols(comparison.common.svd_knn) }}</li>
                <li><strong>All Models:</strong> {{ formatSymbols(comparison.common.all_models) }}</li>
              </ul>
            </div>
          </v-alert>
        </v-col>
      </v-row>

      <v-row>
        <!-- SVD Recommendations -->
        <v-col cols="12" md="4">
          <v-card height="100%">
            <v-card-title>SVD Recommendations</v-card-title>
            <v-card-subtitle>Collaborative Filtering</v-card-subtitle>
            <v-data-table
              :headers="headers"
              :items="comparison.svd_recommendations"
              :items-per-page="10"
              class="elevation-1"
            >
              <template v-slot:item.predicted_rating="{ item }">
                <v-rating
                  :value="item.predicted_rating"
                  readonly
                  half-increments
                  size="small"
                  color="amber"
                ></v-rating>
                <span class="ml-2">{{ parseFloat(item.predicted_rating).toFixed(1) }}</span>
              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <!-- KNN Recommendations -->
        <v-col cols="12" md="4">
          <v-card height="100%">
            <v-card-title>KNN Recommendations</v-card-title>
            <v-card-subtitle>Item-Based Collaborative Filtering</v-card-subtitle>
            <v-data-table
              :headers="headers"
              :items="comparison.knn_recommendations"
              :items-per-page="10"
              class="elevation-1"
            >
              <template v-slot:item.predicted_rating="{ item }">
                <v-rating
                  :value="item.predicted_rating"
                  readonly
                  half-increments
                  size="small"
                  color="amber"
                ></v-rating>
                <span class="ml-2">{{ parseFloat(item.predicted_rating).toFixed(1) }}</span>
              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <!-- Cluster Recommendations -->
        <v-col cols="12" md="4">
          <v-card height="100%">
            <v-card-title>Cluster-Based Recommendations</v-card-title>
            <v-card-subtitle>Preference-Based Clustering</v-card-subtitle>
            <v-data-table
              :headers="headers"
              :items="comparison.cluster_recommendations"
              :items-per-page="10"
              class="elevation-1"
            >
              <template v-slot:item.predicted_rating="{ item }">
                <v-rating
                  :value="item.predicted_rating"
                  readonly
                  half-increments
                  size="small"
                  color="amber"
                ></v-rating>
                <span class="ml-2">{{ parseFloat(item.predicted_rating).toFixed(1) }}</span>
              </template>
            </v-data-table>
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
import Footer from '@/components/Footer.vue';
import NavBarView from '@/components/NavBarView.vue';

export default {
  name: 'CompareRecommendations',
  data() {
    return {
      loading: false,
      userId: this.$route.params.userId || 1,
      count: 5,
      comparison: null,
      error: null,
      headers: [
        { text: 'Symbol', value: 'symbol' },
        { text: 'Predicted Rating', value: 'predicted_rating' },
        { text: 'Sector', value: 'sector' }
      ]
    };
  },
  created() {
    if (this.$route.params.userId) {
      this.compareRecommendations();
    }
  },
  methods: {
    async compareRecommendations() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`/api/recommender/recommendations/compare/${this.userId}`, {
          params: { n: this.count }
        });
        
        if (response.data.status === 'success') {
          this.comparison = response.data;
        } else {
          this.error = response.data.message || 'Failed to compare recommendations';
          this.comparison = null;
        }
      } catch (err) {
        this.error = err.response ? err.response.data.detail : err.message;
        console.error('Error comparing recommendations:', err);
        this.comparison = null;
      } finally {
        this.loading = false;
      }
    },
    
    formatSymbols(symbols) {
      if (!symbols || symbols.length === 0) {
        return 'None';
      }
      return symbols.join(', ');
    }
  }
};
</script>
