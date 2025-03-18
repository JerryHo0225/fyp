<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import NavBarView from '@/components/NavBarView.vue'
import Footer from '@/components/Footer.vue'

const route = useRoute()
const router = useRouter()

// User basic info
const email = ref('')
const firstName = ref('')
const lastName = ref('')
const phoneNumber = ref('')
const loading = ref(false)
const errorMessage = ref('')
const userId = ref(null)

// Stock preferences data
const preferences = ref({
  risk_tolerance: 'medium',
  investment_horizon: '',
  favorite_stocks: [],
  volatility_preference: 'medium',
  preferred_sectors: [],
  avoided_sectors: []
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
const riskToleranceOptions = ['high', 'medium', 'low']
const investmentHorizonOptions = [
  'Short-term (0-1 year)',
  'Medium-term (1-5 years)',
  'Long-term (5+ years)'
]
const volatilityOptions = ['high', 'medium', 'low']
const stockOptions = ref(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA']) // Default options
const sectorOptions = Object.keys(sectorWeights)
const currentStep = ref(1) // 1: Basic info, 2: Stock preferences
const agreeToTerms = ref(false)

// Computed property for form completion status
const basicInfoComplete = computed(() => {
  return firstName.value && lastName.value && phoneNumber.value && agreeToTerms.value
})

// Get the email from query params
onMounted(async () => {
  if (route.query.email) {
    email.value = route.query.email.toString()
    await fetchStocks() // Load available stocks
  } else {
    // If no email is provided, redirect to login
    router.push('/login')
  }
})

// Fetch available stocks from API
const fetchStocks = async () => {
  try {
    // Get all stocks from API using fetch
    const response = await fetch('/api/get500')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data && data.stocks) {
      stockOptions.value = data.stocks.map((stock) => stock.symbol)
    }
  } catch (err) {
    console.error('Error fetching stocks:', err)
    // Using default stock options as fallback (already set)
  }
}

// Continue to next step
const continueToPreferences = () => {
  if (basicInfoComplete.value) {
    currentStep.value = 2
  } else {
    errorMessage.value = 'Please fill in all required fields'
  }
}

// Go back to basic info
const backToBasicInfo = () => {
  currentStep.value = 1
}

// Complete registration process
const registerUser = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    
    // Get the current user session
    const { data } = await supabase.auth.getSession()
    
    if (!data.session) {
      errorMessage.value = 'No active session found. Please login again.'
      router.push('/login')
      return
    }
    
    // Build sector preferences object from selected sectors and weights
    const sectorPreferences = {}
    for (const sector of selectedSectors.value) {
      if (sectorWeights[sector] > 0) {
        sectorPreferences[sector] = sectorWeights[sector]
      }
    }
    
    // Create the user profile in your database with preferences
    const response = await fetch('/api/auth/user/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...data,
        user_details: {
          first_name: firstName.value,
          last_name: lastName.value,
          phone_number: phoneNumber.value
        },
        preferences: {
          risk_tolerance: preferences.value.risk_tolerance,
          investment_horizon: preferences.value.investment_horizon,
          sector_preferences: sectorPreferences,
          favorite_stocks: preferences.value.favorite_stocks,
          volatility_preference: preferences.value.volatility_preference,
          preferred_sectors: preferences.value.preferred_sectors,
          avoided_sectors: preferences.value.avoided_sectors
        }
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to register user')
    }
    
    const result = await response.json()
    console.log('Registration successful:', result)
    
    // Redirect to dashboard or home page
    router.push('/dashboard')
  } catch (error) {
    console.error('Registration error:', error)
    errorMessage.value = error.message || 'An error occurred during registration'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <NavBarView />
    <v-container>
      <v-card class="mb-5 mx-auto" max-width="800px" elevation="3">
        <v-card-title class="headline">Complete Your Registration</v-card-title>
        
        <!-- Progress indicator -->
        <v-card-text class="pb-0">
          <v-stepper v-model="currentStep" :items="['Basic Information', 'Stock Preferences']"></v-stepper>
        </v-card-text>
        
        <v-card-text>
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            closable
            class="mb-4"
          >
            {{ errorMessage }}
          </v-alert>
          
          <v-window v-model="currentStep">
            <!-- Step 1: Basic Information -->
            <v-window-item value="1">
              <v-form>
                <!-- User Details Section -->
                <v-divider class="my-4"></v-divider>
                <h3 class="text-h5 mb-2">
                  User Information
                  <span
                    data-bs-toggle="tooltip"
                    data-bs-placement="right"
                    title="Please provide your personal details to complete your registration."
                  >
                    <i class="bi bi-question-circle" style="font-size: 1.5rem"></i>
                  </span>
                </h3>
                <p class="text-body-2 text-grey mb-4">
                  These details will be used for your account profile.
                </p>

                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="email"
                      label="Email"
                      type="email"
                      readonly
                      disabled
                      outlined
                      bg-color="grey-lighten-4"
                      hint="Your email address is already confirmed"
                      persistent-hint
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="firstName"
                      label="First Name"
                      type="text"
                      outlined
                      required
                      :rules="[v => !!v || 'First name is required']"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="lastName"
                      label="Last Name"
                      type="text"
                      outlined
                      required
                      :rules="[v => !!v || 'Last name is required']"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="phoneNumber"
                      label="Phone Number"
                      type="tel"
                      outlined
                      required
                      :rules="[v => !!v || 'Phone number is required']"
                      hint="Including country code is recommended"
                      persistent-hint
                    ></v-text-field>
                  </v-col>
                </v-row>

                <!-- Terms and Privacy Section -->
                <v-divider class="my-4"></v-divider>
                <v-row>
                  <v-col cols="12">
                    <v-checkbox
                      v-model="agreeToTerms"
                      label="I agree to the Terms of Service and Privacy Policy"
                      required
                      :rules="[v => !!v || 'You must agree to continue']"
                    ></v-checkbox>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" class="text-center">
                    <v-btn
                      color="primary"
                      @click="continueToPreferences"
                      :disabled="!basicInfoComplete"
                      size="large"
                      class="mt-4"
                      block
                      min-width="200px"
                    >
                      Continue to Preferences
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-window-item>
            
            <!-- Step 2: Stock Preferences -->
            <v-window-item value="2">
              <v-form @submit.prevent="registerUser">
                <v-card-title class="headline">My Stock Preferences</v-card-title>
                
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
                  <v-col cols="6">
                    <v-btn
                      color="secondary"
                      @click="backToBasicInfo"
                      size="large"
                      block
                    >
                      Back
                    </v-btn>
                  </v-col>
                  <v-col cols="6">
                    <v-btn
                      color="primary"
                      type="submit"
                      :loading="loading"
                      size="large"
                      block
                    >
                      {{ loading ? 'Creating Account...' : 'Complete Registration' }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>

      <v-card class="mb-5 mx-auto" max-width="800px" elevation="2">
        <v-card-text class="text-center">
          <p class="mb-0">
            Already have an account?
            <v-btn variant="text" color="primary" @click="router.push('/login')"
              >Sign In</v-btn
            >
          </p>
        </v-card-text>
      </v-card>
    </v-container>
    <Footer />
  </div>
</template>

<style scoped>
.v-card-title {
  font-weight: 600;
}

.v-divider {
  margin: 24px 0;
}
</style>
