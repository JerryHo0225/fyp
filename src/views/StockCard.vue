<script setup>
import { ref, onMounted } from 'vue'
import NavBarView from '../components/NavBarView.vue'
import Footer from '@/components/Footer.vue'

const stockProfiles = ref([])
const tickers = ['MMM', 'AAPL', 'NVDA', 'AMD', 'AMZN', 'MSFT']
const isLoading = ref(true)
const error = ref(null)
const expanded = ref({})

const fetchProfileData = async (ticker) => {
  try {
    //example of data
    //     {
    //   "_id": {
    //     "$oid": "675025406c77e8c0c4373e88"
    //   },
    //   "symbol": "NVDA",
    //   "address": "2788 San Tomas Expressway",
    //   "beta": 1.657,
    //   "ceo": "Mr. Jen-Hsun  Huang",
    //   "changes": 1.63,
    //   "cik": "0001045810",
    //   "city": "Santa Clara",
    //   "companyName": "NVIDIA Corporation",
    //   "country": "US",
    //   "currency": "USD",
    //   "cusip": "67066G104",
    //   "dcf": 59.52888904758956,
    //   "dcfDiff": 80.73111,
    //   "defaultImage": false,
    //   "description": "NVIDIA Corporation provides graphics, and compute and networking solutions in the United States, Taiwan, China, and internationally. The company's Graphics segment offers GeForce GPUs for gaming and PCs, the GeForce NOW game streaming service and related infrastructure, and solutions for gaming platforms; Quadro/NVIDIA RTX GPUs for enterprise workstation graphics; vGPU software for cloud-based visual and virtual computing; automotive platforms for infotainment systems; and Omniverse software for building 3D designs and virtual worlds. Its Compute & Networking segment provides Data Center platforms and systems for AI, HPC, and accelerated computing; Mellanox networking and interconnect solutions; automotive AI Cockpit, autonomous driving development agreements, and autonomous vehicle solutions; cryptocurrency mining processors; Jetson for robotics and other embedded platforms; and NVIDIA AI Enterprise and other software. The company's products are used in gaming, professional visualization, datacenter, and automotive markets. NVIDIA Corporation sells its products to original equipment manufacturers, original device manufacturers, system builders, add-in board manufacturers, retailers/distributors, independent software vendors, Internet and cloud service providers, automotive manufacturers and tier-1 automotive suppliers, mapping companies, start-ups, and other ecosystem participants. It has a strategic collaboration with Kroger Co. NVIDIA Corporation was incorporated in 1993 and is headquartered in Santa Clara, California.",
    //   "exchange": "NASDAQ Global Select",
    //   "exchangeShortName": "NASDAQ",
    //   "fullTimeEmployees": "29600",
    //   "image": "https://images.financialmodelingprep.com/symbol/NVDA.png",
    //   "industry": "Semiconductors",
    //   "ipoDate": "1999-01-22",
    //   "isActivelyTrading": true,
    //   "isAdr": false,
    //   "isEtf": false,
    //   "isFund": false,
    //   "isin": "US67066G1040",
    //   "lastDiv": 0.04,
    //   "mktCap": {
    //     "$numberLong": "3434967400000"
    //   },
    //   "phone": "408 486 2000",
    //   "price": 140.26,
    //   "range": "45.271-152.89",
    //   "sector": "Technology",
    //   "state": "CA",
    //   "volAvg": 255432966,
    //   "website": "https://www.nvidia.com",
    //   "zip": "95051"
    // }

    const response = await fetch(`/api/stock_descriptions/${ticker}`)
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

const getImgStyle = () => {
  return {
    backgroundColor: '#808080'
  }
}

onMounted(() => {
  fetchAllProfiles()
})
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
                  <v-img 
                    :src="profile.image" 
                    alt="Company Image" 
                    height="150"
                    :style="getImgStyle()"
                  ></v-img>
                  <v-card-title>{{ profile.companyName }} ({{ profile.symbol }})</v-card-title>
                  <v-card-subtitle>Sector: {{ profile.sector }}</v-card-subtitle>
                  
                  <v-card-subtitle>Website:
                    <a :href="profile.website" target="_blank" rel="noopener">
                       {{ profile.website }}</a
                    >
                  </v-card-subtitle>
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
  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1 0 auto;
  width: 100%;
  padding-bottom: 2rem;
}

.container {
  padding-top: 30px;
}

.v-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.v-card-actions {
  margin-top: auto;
}

.v-card {
  transition: transform 0.3s;
}

.v-card:hover {
  transform: translateY(-5px);
}
</style>
