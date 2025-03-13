<template>
  <NavBarView />
  <v-container>
    <RecommenderNav />

    <v-card class="mb-5">
      <v-card-title class="headline">My Stock Preferences</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="savePreferences">
          <v-row>
            <v-col cols="12" md="6" class="d-flex align-center">
              <v-text-field
                v-model="userId"
                label="User ID"
                type="number"
                outlined
                class="mr-2"
              ></v-text-field>
              <v-btn color="secondary" @click="updateUserId" :loading="loading">
                Update User
              </v-btn>
            </v-col>
          </v-row>

          <!-- Risk Profile Section -->
          <v-divider class="my-4"></v-divider>
          <h3 class="text-h5 mb-2">
            Risk Profile

            <span
              data-bs-toggle="tooltip"
              data-bs-placement="right"
              title="Your risk profile determines how much financial risk you're comfortable taking. Higher
            risk tolerance may lead to recommendations with higher potential returns but greater
            volatility. Your investment horizon indicates how long you plan to hold your
            investments."
            >
              <i class="bi bi-question-circle" style="font-size: 1.5rem"></i>
            </span>
          </h3>
          <p class="text-body-2 text-grey mb-4"></p>

          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="preferences.risk_tolerance"
                :items="riskToleranceOptions"
                label="Risk Tolerance"
                outlined
                required
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="preferences.investment_horizon"
                :items="investmentHorizonOptions"
                label="Investment Horizon"
                outlined
                required
              ></v-select>
            </v-col>
          </v-row>

          <!-- Volatility Preference Section -->
          <v-row>
            <v-col cols="12" md="6">
              <h4 class="text-subtitle-1 mb-2">
                Volatility Preference
                <span
                  data-bs-toggle="tooltip"
                  data-bs-placement="right"
                  title="Volatility represents how much a stock's price fluctuates. High volatility stocks
                may offer greater short-term gains or losses, while low volatility stocks tend to
                have more stable, predictable price movements."
                >
                  <i class="bi bi-question-circle" style="font-size: 1.5rem"></i>
                </span>
              </h4>
              <p class="text-body-2 text-grey mb-2"></p>
              <v-select
                v-model="preferences.volatility_preference"
                :items="volatilityOptions"
                label="Preferred Volatility Level"
                outlined
                required
                hint="Choose your preferred level of price volatility"
                persistent-hint
              ></v-select>
            </v-col>
          </v-row>

          <!-- Sector Weights Section -->
          <v-divider class="my-4"></v-divider>
          <h3 class="text-h5 mb-2">Sector Weights</h3>
          <p class="text-body-2 text-grey mb-4">
            Sector weights allow you to specify how much of your portfolio should be allocated to
            different market sectors. Higher weights indicate a stronger preference for stocks in
            that sector when generating recommendations.
          </p>

          <v-row>
            <v-col cols="12">
              <v-select
                v-model="selectedSectors"
                :items="sectorOptions"
                label="Select Sectors"
                multiple
                chips
                outlined
              ></v-select>
            </v-col>
          </v-row>

          <!-- Only show sliders for sectors the user has selected -->
          <v-row v-for="sector in selectedSectors" :key="sector">
            <v-col cols="12">
              <v-slider
                v-model="sectorWeights[sector]"
                :label="`${sector} Weight: ${sectorWeights[sector]}`"
                thumb-label="always"
                min="0"
                max="1"
                step="0.1"
              ></v-slider>
            </v-col>
          </v-row>

          <!-- Display a message if no sectors are selected -->
          <v-row v-if="selectedSectors.length === 0">
            <v-col cols="12">
              <v-alert type="info" text> Please select sectors to set their weights </v-alert>
            </v-col>
          </v-row>

          <!-- Sector Inclusions & Exclusions Section -->
          <v-divider class="my-4"></v-divider>
          <h3 class="text-h5 mb-2">
            Sector Inclusions & Exclusions
            <span
              data-bs-toggle="tooltip"
              data-bs-placement="right"
              title="Specify sectors you definitely want to include or exclude from your recommendations,
            regardless of their weights. Preferred sectors will be prioritized, while avoided
            sectors won't appear in your recommendations."
            >
              <i class="bi bi-question-circle" style="font-size: 1.5rem"></i>
            </span>
          </h3>
          <p class="text-body-2 text-grey mb-4"></p>

          <v-row>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="preferences.preferred_sectors"
                :items="sectorOptions"
                label="Preferred Sectors"
                multiple
                chips
                clearable
                outlined
              ></v-autocomplete>
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="preferences.avoided_sectors"
                :items="sectorOptions"
                label="Avoided Sectors"
                multiple
                chips
                clearable
                outlined
              ></v-autocomplete>
            </v-col>
          </v-row>

          <!-- Favorite Stocks Section -->
          <v-divider class="my-4"></v-divider>
          <h3 class="text-h5 mb-2">Favorite Stocks</h3>
          <p class="text-body-2 text-grey mb-4">
            Select stocks you're already interested in. The recommendation system will use these to
            better understand your preferences and suggest similar stocks you might want to
            consider.
          </p>

          <v-row>
            <v-col cols="12">
              <v-autocomplete
                v-model="preferences.favorite_stocks"
                :items="stockOptions"
                label="Favorite Stocks"
                multiple
                chips
                clearable
                outlined
              ></v-autocomplete>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" class="text-center">
              <v-btn color="primary" type="submit" :loading="loading" size="large" class="mt-4">
                Save Preferences
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <v-alert v-if="message.text" :type="message.type" class="mt-4" dismissible>
      {{ message.text }}
    </v-alert>

    <!-- API Response Section -->
    <v-expansion-panels class="mt-5" variant="accordion">
      <v-expansion-panel>
        <v-expansion-panel-title>
          <div class="text-subtitle-1">
            <v-icon start icon="mdi-account" class="mr-2"></v-icon>
            Current User Data (User ID: {{ userId }})
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card flat>
            <v-card-text class="bg-grey-lighten-4">
              <pre class="sample-json">{{ currentUserData }}</pre>
            </v-card-text>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-title>
          <div class="text-subtitle-1">
            <v-icon start icon="mdi-code-json" class="mr-2"></v-icon>
            Sample API Response (GET /api/user/preference/2)
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card flat>
            <v-card-text class="bg-grey-lighten-4">
              <pre class="sample-json">{{ JSON.stringify(sampleApiResponse, null, 2) }}</pre>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="loadSampleUser" :disabled="userId === 2">
                Load Sample User (ID: 2)
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
  <Footer />
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { supabase } from '@/supabase'
import NavBarView from '@/components/NavBarView.vue'
import RecommenderNav from '@/components/RecommenderNav.vue'
import Footer from '@/components/Footer.vue'

// Data
const loading = ref(false)
const userId = ref(1) // Default user ID
const preferences = ref({
  risk_tolerance: 'medium',
  investment_horizon: '',
  favorite_stocks: [],
  // Updated volatility_preference to be a string value
  volatility_preference: 'medium', // Default to middle value
  preferred_sectors: [],
  avoided_sectors: [],
  email: ''
})

const sectorWeights = reactive({
  Technology: 0,
  Healthcare: 0,
  Financials: 0,
  'Consumer Cyclical': 0,
  'Communication Services': 0,
  Industrials: 0,
  'Consumer Defensive': 0,
  Utilities: 0,
  Energy: 0,
  'Real Estate': 0,
  'Basic Materials': 0
})

const selectedSectors = ref([])
const message = reactive({
  text: '',
  type: 'info'
})

// Get list of sectors from sectorWeights keys for the autocomplete
const sectorOptions = Object.keys(sectorWeights)
const stockOptions = ref([])
const riskToleranceOptions = ['high', 'medium', 'low']
const investmentHorizonOptions = [
  'Short-term (0-1 year)',
  'Medium-term (1-5 years)',
  'Long-term (5+ years)'
]
const volatilityOptions = ['high', 'medium', 'low'] // New array for volatility options

const sampleApiResponse = {
  user_id: 2,
  risk_tolerance: 'high',
  investment_horizon: 'long',
  sector_preferences: {
    Industrial: 0.24,
    Financial: 0.19,
    'Real Estate': 0.14,
    Communication: 0.12,
    'Consumer Defensive': 0.11,
    Energy: 0.1,
    Healthcare: 0.1
  },
  favorite_stocks: ['FE', 'XRAY', 'GRMN', 'DLTR', 'HRB'],
  // Update sample volatility preference to be a string
  volatility_preference: 'high',
  preferred_sectors: ['Technology', 'Healthcare'],
  avoided_sectors: ['Energy', 'Basic Materials']
}

// Computed properties
const currentUserData = computed(() => {
  // Format current user data for display
  const sectorPrefs = {}
  for (const sector of selectedSectors.value) {
    if (sectorWeights[sector] > 0) {
      sectorPrefs[sector] = sectorWeights[sector]
    }
  }

  const userData = {
    user_id: userId.value,
    risk_tolerance: preferences.value.risk_tolerance,
    investment_horizon: preferences.value.investment_horizon,
    sector_preferences: sectorPrefs,
    favorite_stocks: preferences.value.favorite_stocks,
    // Add new fields to user data
    volatility_preference: preferences.value.volatility_preference,
    preferred_sectors: preferences.value.preferred_sectors,
    avoided_sectors: preferences.value.avoided_sectors
  }

  return JSON.stringify(userData, null, 2)
})

// Methods
const getCurrentUser = async () => {
  try {
    const { data } = await supabase.auth.getSession()

    console.log('User session data:', data.session.user.email)

    return data.session.user.email
  } catch (error) {
    console.error('Error getting user session:', error)
    message.text = 'Error retrieving user information. Using default user ID 1.'
    message.type = 'warning'
  }
}

const fetchUserPreferences = async () => {
  try {
    loading.value = true

    // Get user preferences from API using fetch
    const response = await fetch(`/api/user/preference/${userId.value}`)

    if (!response.ok) {
      if (response.status === 404) {
        // User doesn't have preferences yet, use defaults
        console.info('No existing preferences found for this user.')
        return
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Parse JSON response once and store the result
    const data = await response.json()
    console.log('User preferences data:', data.preference)

    if (data) {
      //getCurrentUser();

      // Set basic preferences
      preferences.value.risk_tolerance = data.preference.risk_tolerance
      preferences.value.investment_horizon = data.preference.investment_horizon
      preferences.value.favorite_stocks = data.preference.favorite_stocks || []

      // Set new fields with default values if they don't exist
      preferences.value.volatility_preference = data.preference.volatility_preference || 'medium'
      preferences.value.preferred_sectors = data.preference.preferred_sectors || []
      preferences.value.avoided_sectors = data.preference.avoided_sectors || []

      // Reset sector weights
      for (const sector in sectorWeights) {
        sectorWeights[sector] = 0
      }

      // Clear selected sectors first
      selectedSectors.value = []

      // Set sector weights from API data and update selected sectors
      if (data.preference.sector_preferences) {
        for (const [sector, weight] of Object.entries(data.preference.sector_preferences)) {
          if (sector in sectorWeights) {
            sectorWeights[sector] = weight
            // Only add to selectedSectors if not already there
            if (!selectedSectors.value.includes(sector)) {
              selectedSectors.value.push(sector)
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error fetching user preferences:', err)
    message.text = 'Error loading your preferences. Using default values.'
    message.type = 'warning'
  } finally {
    loading.value = false
  }
}

const fetchStocks = async () => {
  try {
    // Get all stocks from API using fetch
    const response = await fetch('/api/recommender/stocks')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data && data.stocks) {
      stockOptions.value = data.stocks.map((stock) => stock.symbol)
    }
  } catch (err) {
    console.error('Error fetching stocks:', err)
    // Use some default stock options as fallback
    stockOptions.value = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA']
  }
}

const savePreferences = async () => {
  try {
    loading.value = true
    message.text = ''
    message.type = 'info'

    // Build sector preferences object from selected sectors and weights
    const sectorPreferences = {}
    for (const sector of selectedSectors.value) {
      if (sectorWeights[sector] > 0) {
        sectorPreferences[sector] = sectorWeights[sector]
      }
    }

    const { data } = await supabase.auth.getSession()

    console.log('User session data:', data.session.user.email)

    // Create request payload
    const payload = {
      user_id: userId.value,
      risk_tolerance: preferences.value.risk_tolerance,
      investment_horizon: preferences.value.investment_horizon,
      sector_preferences: sectorPreferences,
      favorite_stocks: preferences.value.favorite_stocks,
      // Add new fields to payload
      volatility_preference: preferences.value.volatility_preference,
      preferred_sectors: preferences.value.preferred_sectors,
      avoided_sectors: preferences.value.avoided_sectors,
      email: data.session.user.email
    }

    let response
    let responseData

    //payload.email = getCurrentUser();

    //console.log('Payload:', payload.email);

    try {
      // Try to get existing preferences first
      const checkResponse = await fetch(`/api/user/preference/${userId.value}`)

      if (checkResponse.ok) {
        // If it exists, update it with PUT
        response = await fetch(`/api/user/preference/update/${userId.value}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
      } else if (checkResponse.status === 404) {
        // If not found, create new preferences with POST
        response = await fetch('/api/user/preference', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
      } else {
        throw new Error(`HTTP error! status: ${checkResponse.status}`)
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Parse JSON response once
      responseData = await response.json()
      console.log('Save response:', responseData)
    } catch (error) {
      throw error
    }

    if (responseData && responseData.status === 'success') {
      message.text = 'Your preferences have been saved successfully!'
      message.type = 'success'
    } else {
      throw new Error('Unexpected response from server')
    }
  } catch (err) {
    console.error('Error saving preferences:', err)
    message.text = 'Error saving your preferences: ' + (err.message || 'Please try again later')
    message.type = 'error'
  } finally {
    loading.value = false
  }
}

// Helper method to map between different sector name formats
const mapSectorName = (sector) => {
  const sectorMapping = {
    Industrial: 'Industrials',
    Financial: 'Financials',
    Communication: 'Communication Services',
    'Consumer Defensive': 'Consumer Defensive',
    Healthcare: 'Healthcare',
    Energy: 'Energy',
    'Real Estate': 'Real Estate'
  }

  return sectorMapping[sector] || sector
}

const loadSampleUser = () => {
  // Set the user ID to 2 and load the sample user
  userId.value = 2
  updateUserId()
}

const updateUserId = async () => {
  try {
    loading.value = true
    message.text = ''
    message.type = 'info'

    // Reset preferences including new fields
    preferences.value.risk_tolerance = 'medium'
    preferences.value.investment_horizon = 'medium'
    preferences.value.favorite_stocks = []
    preferences.value.volatility_preference = 'medium'
    preferences.value.preferred_sectors = []
    preferences.value.avoided_sectors = []

    selectedSectors.value = []

    // Reset sector weights
    for (const sector in sectorWeights) {
      sectorWeights[sector] = 0
    }

    // Special case for user ID 2 - we can use the sample data directly
    if (userId.value === 2) {
      preferences.value.risk_tolerance = sampleApiResponse.risk_tolerance
      preferences.value.investment_horizon = sampleApiResponse.investment_horizon
      preferences.value.favorite_stocks = [...sampleApiResponse.favorite_stocks]

      // Set new fields from sample
      preferences.value.volatility_preference = sampleApiResponse.volatility_preference
      preferences.value.preferred_sectors = [...sampleApiResponse.preferred_sectors]
      preferences.value.avoided_sectors = [...sampleApiResponse.avoided_sectors]

      // Set sector weights from sample data
      for (const [sector, weight] of Object.entries(sampleApiResponse.sector_preferences)) {
        const sectorKey = mapSectorName(sector)
        if (sectorKey in sectorWeights) {
          sectorWeights[sectorKey] = weight
          selectedSectors.value.push(sectorKey)
        }
      }

      message.text = `Loaded sample data for User ID: ${userId.value}`
      message.type = 'success'
    } else {
      // Fetch preferences for other user IDs
      await fetchUserPreferences()

      message.text = `Updated to User ID: ${userId.value}`
      message.type = 'info'
    }
  } catch (err) {
    console.error('Error updating user ID:', err)
    message.text =
      'Failed to update user ID: ' + (err.response?.data?.detail || err.message || 'Unknown error')
    message.type = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.v-card-text {
  padding-top: 20px;
}
.v-divider {
  margin: 24px 0;
}

.sample-json {
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 14px;
  padding: 8px;
  border-radius: 4px;
  line-height: 1.5;
}
</style>
