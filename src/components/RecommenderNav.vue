<template>
  <v-card class="mb-5">
    <v-card-title class="headline">Stock Recommender System</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12">
          <v-btn  to="/recommender/initialize" class="mr-2 mb-2">
            <!-- <v-icon left>mdi-database-plus</v-icon> -->
            Initialize System
          </v-btn>
          
          <v-btn  to="/recommender/recommendations" class="mr-2 mb-2">
            <!-- <v-icon left>mdi-star</v-icon> -->
            Get Recommendations
          </v-btn>
          
          <v-btn  to="/recommender/compare-recommendations" class="mr-2 mb-2">
            <!-- <v-icon left>mdi-compare</v-icon> -->
            Compare Algorithms
          </v-btn>
          
          <v-btn to="/recommender/model-evaluation" class="mr-2 mb-2">
            <!-- <v-icon left>mdi-chart-bar</v-icon> -->
            Evaluate Models
          </v-btn>
        </v-col>
      </v-row>
      
      <v-row>
        <v-col cols="12">
          <v-btn  to="/recommender/users" class="mr-2 mb-2">
            <!-- <v-icon left>mdi-account-group</v-icon> -->
            Users
          </v-btn>
          
          <v-btn  to="/recommender/stocks" class="mr-2 mb-2">
            <!-- <v-icon left>mdi-cash</v-icon> -->
            Stocks
          </v-btn>
          
          <v-btn  to="/recommender/user-preferences" class="mr-2 mb-2">
            <!-- <v-icon left>mdi-account-details</v-icon> -->
            User Preferences
          </v-btn>
        </v-col>
      </v-row>
      
      <v-row>
        <v-col cols="12">
          <v-btn  to="/recommender/user-clusters" class="mr-2 mb-2">
            <!-- <v-icon left>mdi-account-group-outline</v-icon> -->
            User Clusters
          </v-btn>
          
          <v-btn  to="/recommender/stock-clusters" class="mr-2 mb-2">
            <!-- <v-icon left>mdi-chart-bubble</v-icon> -->
            Stock Clusters
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'RecommenderNav'
}
</script>
