<template>
      <NavBarView />
  <v-container>
    <v-card class="mb-5">
      <v-card-title class="headline">Recommendation Model Evaluation</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="evaluateModels">
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="k"
                label="K (Number of Recommendations)"
                type="number"
                min="1"
                max="20"
                hint="Number of recommendations to consider for evaluation"
                persistent-hint
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-text-field
                v-model="nSplits"
                label="N Splits"
                type="number"
                min="2"
                max="10"
                hint="Number of cross-validation splits"
                persistent-hint
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-text-field
                v-model="relevanceThreshold"
                label="Relevance Threshold"
                type="number"
                min="1"
                max="5"
                step="0.1"
                hint="Minimum rating to consider an item relevant"
                persistent-hint
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-btn color="primary" type="submit" :loading="loading" class="mt-4">
                Evaluate Models
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card v-if="results">
      <v-card-title>Evaluation Results</v-card-title>
      <v-card-subtitle v-if="results.best_model">
        Best Model: <strong>{{ results.best_model.name?.toUpperCase() || 'N/A' }}</strong> with score {{ results.best_model.score || 'N/A' }}
      </v-card-subtitle>
      
      <v-card-text>
        <v-row>
          <v-col v-for="(score, model) in results.model_scores || {}" :key="model" cols="12" md="4">
            <v-card
              :color="results.best_model && model === results.best_model.name ? 'primary' : ''"
              :dark="results.best_model && model === results.best_model.name"
              elevation="2"
            >
              <v-card-title>{{ model.toUpperCase() }}</v-card-title>
              <v-card-text>
                <div class="text-h2 text-center">{{ score }}</div>
                <v-divider class="my-2"></v-divider>
                <v-list dense>
                  <v-list-item v-for="(value, metric) in (results.results && results.results[model]) || {}" :key="metric">
                    <v-list-item-content>
                      <v-list-item-title>{{ formatMetricName(metric) }}</v-list-item-title>
                      <v-list-item-subtitle>{{ formatMetricValue(metric, value) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
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
import Footer from '@/components/Footer.vue';
import NavBarView from '@/components/NavBarView.vue';

export default {
  name: 'ModelEvaluation',
  data() {
    return {
      loading: false,
      k: 5,
      nSplits: 3,
      relevanceThreshold: 3.5,
      results: null,
      error: null
    };
  },
  methods: {
    async evaluateModels() {
      this.loading = true;
      this.error = null;
      try {
        const params = {
          k: this.k,
          n_splits: this.nSplits,
          relevance_threshold: this.relevanceThreshold
        };
        
        const response = await axios.get('/api/evaluate-models', { params });
        
        if (response.data.status === 'success') {
          // The API returns direct model data, so we need to process it into the expected structure
          const modelData = response.data.results;
          
          // If the API response doesn't have our expected structure, format it properly
          if (!modelData.best_model && !modelData.model_scores && !modelData.results) {
            console.log('Formatting API response to match expected structure');
            
            // Extract model names and calculate average scores
            const modelScores = {};
            const modelResults = {};
            let bestModelName = '';
            let bestModelScore = -Infinity;
            
            // Process each model's metrics
            Object.keys(modelData).forEach(modelName => {
              // Store full results
              modelResults[modelName] = modelData[modelName];
              
              // Calculate average metric as the model's score
              // You can adjust this calculation based on what metrics are important to you
              const metrics = modelData[modelName];
              let sum = 0;
              let count = 0;
              
              Object.entries(metrics).forEach(([key, value]) => {
                if (typeof value === 'number' && !isNaN(value)) {
                  // For metrics where lower is better (like RMSE), we invert the contribution
                  if (key === 'rmse') {
                    sum += (1 / (1 + value)); // Transform so higher is better
                  } else {
                    sum += value;
                  }
                  count++;
                }
              });
              
              const avgScore = count > 0 ? sum / count : 0;
              modelScores[modelName] = avgScore.toFixed(4);
              
              // Track best model
              if (avgScore > bestModelScore) {
                bestModelScore = avgScore;
                bestModelName = modelName;
              }
            });
            
            // Create formatted results object
            this.results = {
              best_model: {
                name: bestModelName,
                score: modelScores[bestModelName]
              },
              model_scores: modelScores,
              results: modelResults
            };
          } else {
            // The response already has the expected structure
            this.results = modelData;
          }
        } else {
          this.error = response.data.message || 'Failed to evaluate models';
          this.results = null;
        }
      } catch (err) {
        this.error = err.response ? err.response.data.detail : err.message;
        console.error('Error evaluating models:', err);
        this.results = null;
      } finally {
        this.loading = false;
      }
    },
    
    formatMetricName(metric) {
      if (!metric) return 'Unknown Metric';
      
      // Convert snake_case to Title Case
      return metric
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },
    
    formatMetricValue(metric, value) {
      if (value === undefined || value === null) return 'N/A';
      
      // Format metric values appropriately
      if (metric === 'rmse') {
        return parseFloat(value).toFixed(4);
      } else if (['precision', 'recall', 'coverage', 'diversity'].includes(metric)) {
        return (parseFloat(value) * 100).toFixed(2) + '%';
      }
      return value;
    }
  }
};
</script>
