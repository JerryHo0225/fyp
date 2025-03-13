<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { supabase } from '../supabase'
import RecommenderHome from '@/views/recommender/RecommenderHome.vue'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const isLoggedIn = ref(false)
const userRole = ref('')
const isanalyst = ref(false)  // Add this line
const isAdmin = ref(false) // Add this line

// The nav-link items active status handling
const active = ref({
  main: 'nav-link',
  //viewpridect: "nav-link",
  stockSelection: 'nav-link', // Updated name
  ratingSelection: 'nav-link', // Updated name
  forecast: 'nav-link',
  choosePrediction: 'nav-link',
  dashboard: 'nav-link',
  stocksSymbols: 'nav-link',
  RecommenderHome: 'nav-link',
  adminUsers: 'nav-link' // Add this line
})

// The nav-link items active status handling function
const pageActice = function () {
  if (route.path == '/') {
    active.value.main = 'nav-link active'
  } else if (route.path == '/selectstock') {
    active.value.stockSelection = 'nav-link active' // Updated name
  } else if (route.path == '/selectrating') {
    active.value.ratingSelection = 'nav-link active' // Updated name
  } else if (route.path == '/forecast') {
    active.value.forecast = 'nav-link active'
  } else if (route.path == '/choose-prediction') {
    active.value.choosePrediction = 'nav-link active'
  } else if (route.path == '/dashboard') {
    active.value.dashboard = 'nav-link active'
  } else if (route.path == '/stocks/symbols') {
    active.value.stocksSymbols = 'nav-link active'
  } else if (route.path == '/admin/users') {
    active.value.adminUsers = 'nav-link active' // Add this line
  } else if (route.path == '/recommender') {
    active.value.RecommenderHome = 'nav-link active'
}
}

// System Logout Function
const logout = function () {
  localStorage.removeItem('token')
  alert('You have been logged out')
  router.push('/')
}

async function signOut() {
  try {
    loading.value = true
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    isLoggedIn.value = false
    router.push('/login')
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  isLoggedIn.value = !!data.session

  console.log(data);
  

  // Get user role from session if available
  if (data.session?.user) {
    // First check if profile exists
    let { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.session.user.id)
      .single()
    
    // If profile doesn't exist, create one
    if (!profileData) {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: data.session.user.id,
            email: data.session.user.email,
            isanalyst: false,
            isAdmin: false,
            username: data.session.user.email
          }
        ])
        .select()
        .single()

      if (!insertError) {
        profileData = newProfile
      }
    }

    // Update the role states
    isanalyst.value = profileData?.isanalyst || false
    isAdmin.value = profileData?.isadmin || false
    
  }
  pageActice()
})
</script>

<template>
  <nav class="navbar navbar-expand-lg navigation-clean bg-body-tertiary">
    <div class="container-fluid">
      <a class="navbar-brand"></a>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <!-- <a :class="active.main" href="/">Main</a> -->
          <!-- <a :class="active.viewpridect" href="/viewpridect">viewpridect</a> -->
          <a :class="active.stockSelection" href="/selectstock">Stock Selection</a>
          <!-- Updated name -->
          <a :class="active.ratingSelection" href="/selectrating">Rating Selection</a>
          <!-- Updated name -->
          <!-- Only show Choose Prediction link if user is an analyst -->
          <a :class="active.choosePrediction" href="/choose-prediction" v-if="isanalyst">Choose Prediction</a>
          <a :class="active.dashboard" href="/dashboard">Dashboard</a>
          <a :class="active.stocksSymbols" href="/stocks/symbols">Stock Symbols</a>
          <a :class="active.RecommenderHome" href="/recommender">Recommender system</a>
          <a :class="active.adminUsers" href="/admin/users" v-if="isAdmin">Manage Users</a> <!-- Add this line -->
        </ul>
        <button type="button" class="btn btn-outline-danger" v-if="isLoggedIn" @click="signOut">
          Sign Out
        </button>
        <button type="button" class="btn btn-outline-primary" v-else @click="router.push('/login')">
          Sign In
        </button>
      </div>
    </div>
  </nav>
</template>

<style>
.nav-link.active {
  text-decoration: underline;
  font-weight: bold; /* Optional: makes the text bold for better visibility */
}
</style>
