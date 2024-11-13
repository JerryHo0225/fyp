<script setup>
import CalendarView from '../components/CalendarView.vue'
import NavBarView from '../components/NavBarView.vue'

import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { jwtDecode } from 'jwt-decode'
</script>

<template>
  <main>
    <NavBarView></NavBarView>

    <div class="container">
      <v-container>
        <v-row>
          <!-- Card 1 -->
          <v-col cols="12" sm="6" md="4">
            <v-card class="mx-auto" max-width="400">
              <v-card-title>3M</v-card-title>
              <v-card-text>
               
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary"  href="http://localhost:5173/viewchart/MMM">View the chart of 3M</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <!-- Card 2 -->
          <v-col cols="12" sm="6" md="4">
            <v-card class="mx-auto" max-width="400">
              <v-card-title>Apple</v-card-title>
              <v-card-text>
              
              </v-card-text>
              <v-card-actions>
                <v-btn color="secondary" href="http://localhost:5173/viewchart/AAPL">View the chart of Apple</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <!-- Card 3 -->
          <v-col cols="12" sm="6" md="4">
            <v-card class="mx-auto" max-width="400">
              <v-card-title>Microsoft</v-card-title>
              <v-card-text>
                
              </v-card-text>
              <v-card-actions>
                <v-btn color="success"  href="http://localhost:5173/viewchart/MSTF">View the chart of Microsoft</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <!-- Card 4 -->
          <v-col cols="12" sm="6" md="4">
            <v-card class="mx-auto" max-width="400">
              <v-card-title>Abbott</v-card-title>
              <v-card-text>
                
              </v-card-text>
              <v-card-actions>
                <v-btn color="info" href="http://localhost:5173/viewchart/ABT">View the chart of Abbott</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <!-- Card 5 -->
          <v-col cols="12" sm="6" md="4">
            <v-card class="mx-auto" max-width="400">
              <v-card-title>Amazon</v-card-title>
              <v-card-text>
                
              </v-card-text>
              <v-card-actions>
                <v-btn color="warning" href="http://localhost:5173/viewchart/AMZN">View the chart of Amazon</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <!-- Card 6 -->
          <v-col cols="12" sm="6" md="4">
            <v-card class="mx-auto" max-width="400">
              <v-card-title>Ebay</v-card-title>
              <v-card-text>
                
              </v-card-text>
              <v-card-actions>
                <v-btn color="error" href="http://localhost:5173/viewchart/EBAY">View the chart of Ebay</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </main>
</template>

<style scoped>
.container {
  padding-top: 30px;
}

.v-card {
  transition: transform 0.3s;
}

.v-card:hover {
  transform: translateY(-5px);
}
</style>