<template>
      <NavBarView />
  <v-container>
    <v-card>
      <v-card-title class="headline">
        All Users in Recommender System
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
          :items="users"
          :search="search"
          :loading="loading"
          :items-per-page="10"
          class="elevation-1"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Total Users: {{ users.length }}</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="fetchUsers">
                <v-icon left>mdi-refresh</v-icon>
                Refresh
              </v-btn>
            </v-toolbar>
          </template>
          
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
          
          <template v-slot:item.cluster="{ item }">
            <v-chip color="primary" dark small>
              {{ item.cluster }}
            </v-chip>
          </template>
          
          <template v-slot:item.actions="{ item }">
            <v-btn
              small
              text
              color="primary"
              :to="`/recommender/user-preferences/${item.user_id}`"
            >
              <v-icon small>mdi-account-details</v-icon>
              View Preferences
            </v-btn>
            <v-btn
              small
              text
              color="primary"
              :to="`/recommender/compare-recommendations/${item.user_id}`"
            >
              <v-icon small>mdi-table-compare</v-icon>
              Compare Recommendations
            </v-btn>
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
  name: 'RecommenderUsers',
  data() {
    return {
      loading: false,
      users: [],
      search: '',
      error: null,
      headers: [
        { text: 'User ID', value: 'user_id' },
        { text: 'Risk Tolerance', value: 'risk_tolerance' },
        { text: 'Investment Horizon', value: 'investment_horizon' },
        { text: 'Cluster', value: 'cluster' },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    };
  },
  created() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('/api/recommender/users');
        
        if (response.data.status === 'success') {
          this.users = response.data.users;
        } else {
          this.error = response.data.message || 'Failed to fetch users';
          this.users = [];
        }
      } catch (err) {
        this.error = err.response ? err.response.data.detail : err.message;
        console.error('Error fetching users:', err);
        this.users = [];
      } finally {
        this.loading = false;
      }
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
