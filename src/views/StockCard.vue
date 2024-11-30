<script setup>
import { ref, onMounted } from 'vue'
import NavBarView from '../components/NavBarView.vue'
import Footer from '@/components/Footer.vue'

const stockProfiles = ref([])
const tickers = ['MMM', 'AAPL', 'MSFT', 'ABT', 'AMZN', 'EBAY']
const isLoading = ref(true)
const error = ref(null)
const expanded = ref({})

const fetchProfileData = async (ticker) => {
  try {
    const response = await fetch(`/api/profile/${ticker}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const profileData = await response.json()
    return profileData[0]
  } catch (err) {
    console.error('Error fetching profile data:', err)
    return null
  }
}

const fetchAllProfiles = async () => {
  try {
    const profiles = await Promise.all(tickers.map((ticker) => fetchProfileData(ticker)))
    stockProfiles.value = profiles.filter((profile) => profile !== null)
    profiles.forEach((profile) => {
      if (profile) {
        expanded.value[profile.ticker] = false
      }
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
    console.error('Error fetching all profiles:', err)
  } finally {
    isLoading.value = false
  }
}

const toggleExpand = (ticker) => {
  expanded.value[ticker] = !expanded.value[ticker]
}

onMounted(() => {
  fetchAllProfiles()
})
</script>

<template>
  <main>
    <NavBarView></NavBarView>

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
                <v-card-title>{{ profile.companyName }}</v-card-title>
                <v-card-subtitle>Description</v-card-subtitle>
                <v-card-text>
                  {{ profile.website }}
                </v-card-text>
                <v-card-actions>
                  <!-- <v-btn @click="toggleExpand(profile.ticker)">
                    {{ expanded[profile.ticker] ? 'Show Less' : 'Show More' }}
                  </v-btn> -->
                  <v-btn
                    :color="profile.color"
                    :href="`http://localhost:5173/viewchart/${profile.symbol}`"
                  >
                    View chart of {{ profile.companyName }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </template>
        </v-row>
      </v-container>
    </div>
  </main>
  <Footer></Footer>
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
