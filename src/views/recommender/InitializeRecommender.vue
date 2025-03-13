<template>
      <NavBarView />
  <v-container>
    <v-card class="mb-5">
      <v-card-title class="headline">Initialize Recommender System</v-card-title>
      <v-card-text>
        <p>Initialize the recommender system with sample data and train the recommendation models.</p>
        <v-btn color="primary" @click="initializeRecommender" :loading="loading">
          Initialize Recommender
        </v-btn>
      </v-card-text>
    </v-card>

    <v-card v-if="result">
      <v-card-title>Initialization Results</v-card-title>
      <v-card-text>
        <v-alert
          :type="result.status === 'success' ? 'success' : 'error'"
          border="left"
          colored-border
          elevation="2"
          class="mb-4"
        >
          {{ result.message }}
        </v-alert>
        
        <div v-if="result.status === 'success'">
          <h3>Statistics:</h3>
          <v-list dense>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Users Count</v-list-item-title>
                <v-list-item-subtitle>{{ result.users_count }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Stocks Count</v-list-item-title>
                <v-list-item-subtitle>{{ result.stocks_count }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Interactions Count</v-list-item-title>
                <v-list-item-subtitle>{{ result.interactions_count }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>
    </v-card>
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
  name: 'InitializeRecommender',
  data() {
    return {
      loading: false,
      result: null,
      error: null
    };
  },
  methods: {
    async initializeRecommender() {
      this.loading = true;
      try {
        const response = await axios.post('/api/initialize');
        this.result = response.data;
      } catch (err) {
        this.error = err.response ? err.response.data : err.message;
        console.error('Error initializing recommender:', err);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
