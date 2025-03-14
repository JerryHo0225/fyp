<script setup>
import { ref, onMounted } from 'vue';
import NavBarView from '../components/NavBarView.vue';
import Footer from '@/components/Footer.vue'

const stockProfiles = ref([]);
const tickers = ['MMM', 'AAPL', 'MSFT', 'NVDA', 'AMZN', 'EBAY'];
const isLoading = ref(true);
const error = ref(null);
const expanded = ref({});

const fetchProfileData = async (ticker) => {
  try {
    const response = await fetch(`/api/rating/${ticker}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const profileData = await response.json();
    return profileData[0];
  } catch (err) {
    console.error('Error fetching profile data:', err);
    return null;
  }
};

const fetchAllProfiles = async () => {
  try {
    const profiles = await Promise.all(tickers.map((ticker) => fetchProfileData(ticker)));
    stockProfiles.value = profiles.filter((profile) => profile !== null);
    profiles.forEach((profile) => {
      if (profile) {
        expanded.value[profile.ticker] = false;
      }
    });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
    console.error('Error fetching all profiles:', err);
  } finally {
    isLoading.value = false;
  }
};

const toggleExpand = (ticker) => {
  expanded.value[ticker] = !expanded.value[ticker];
};

onMounted(() => {
  fetchAllProfiles();
});
</script>

<template>
  <div class="page-wrapper">
    <NavBarView></NavBarView>

    <main class="content">
      <div class="container">
        <v-container>
          <v-row>
            <template v-if="isLoading">
              <v-col cols="12">
                <v-alert type="info">Loading data...</v-alert>
              </v-col>
            </template>
            <template v-else-if="error">
              <v-col cols="12">
                <v-alert type="error">{{ error }}</v-alert>
              </v-col>
            </template>
            <template v-else>
              <v-col v-for="profile in stockProfiles" :key="profile.ticker" cols="12" sm="6" md="4">
                <v-card class="mx-auto" max-width="400">
                  <v-card-title>{{ profile.symbol }}</v-card-title>
                  <v-card-subtitle>Ratings: High score rating score is 5</v-card-subtitle>
                  <v-card-text>
                    <v-simple-table>
                      <thead>
                        <tr>
                          <th>Metric</th>
                          <th>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Rating</td>
                          <td>{{ profile.rating }}  </td>
                        </tr>
                        <tr>
                          <td>DCF Score </td>
                          <td>{{ profile.ratingDetailsDCFScore }}</td>
                        </tr>
                        <tr>
                          <td>ROE Score </td>
                          <td>{{ profile.ratingDetailsROEScore }}</td>
                        </tr>
                        <tr>
                          <td>ROA Score </td>
                          <td>{{ profile.ratingDetailsROAScore }}</td>
                        </tr>
                        <tr>
                          <td>DE Score </td>
                          <td>{{ profile.ratingDetailsDEScore }}</td>
                        </tr>
                        <tr>
                          <td>PE Score </td>
                          <td>{{ profile.ratingDetailsPEScore }}</td>
                        </tr>
                        <tr>
                          <td>PB Score </td>
                          <td>{{ profile.ratingDetailsPBScore }}</td>
                        </tr>
                      </tbody>
                    </v-simple-table>
                  </v-card-text>
                  
                </v-card>
              </v-col>
            </template>
          </v-row>
        </v-container>
      </div>
    </main>
    <p>Add Reference</p>
    <Footer></Footer>
  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
}

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