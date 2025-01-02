<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { supabase } from '../supabase'

const router = useRouter()
const route = useRoute()
const loading = ref(false)

// The nav-link items active status handling
const active = ref({
  main: "nav-link",
  //viewpridect: "nav-link",
  stockSelection: "nav-link", // Updated name
  ratingSelection: "nav-link", // Updated name
  forecast: "nav-link",
  choosePrediction: "nav-link",
  dashboard: "nav-link",
  stocksSymbols: "nav-link"
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
    router.push('/login')
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  pageActice()
})

</script>

<template>
  <nav class="navbar navbar-expand-lg navigation-clean bg-body-tertiary">
    <div class="container-fluid">
      <a class="navbar-brand">System</a>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <a :class="active.main" href="/">Main</a>
          <!-- <a :class="active.viewpridect" href="/viewpridect">viewpridect</a> -->
          <a :class="active.stockSelection" href="/selectstock">Stock Selection</a> <!-- Updated name -->
          <a :class="active.ratingSelection" href="/selectrating">Rating Selection</a> <!-- Updated name -->
          <a :class="active.choosePrediction" href="/choose-prediction">Choose Prediction</a>
          <a :class="active.dashboard" href="/dashboard">Dashboard</a>
          <a :class="active.stocksSymbols" href="/stocks/symbols">Stock Symbols</a> <!-- Add this line -->
        </ul>
        <button type="button" class="btn btn-outline-danger" @click="signOut">Sign Out</button>
      </div>
    </div>
  </nav>
</template>
