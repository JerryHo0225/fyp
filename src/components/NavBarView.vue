<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { jwtDecode } from 'jwt-decode'

// const needHandle = inject('needHandle')

const router = useRouter()
const route = useRoute()


// The nav-link items active status handling
const active = ref({
  main: "nav-link",
  predict: "nav-link",
  selectstock: "nav-link",
  selectrating: "nav-link",
  forecast: "nav-link",
  // endorsement: "nav-link",
  // approvaled: "nav-link",
  // reject: "nav-link",
  // need_info: "nav-link",
  // admin: "nav-link",
  // admin_management: "nav-link",
  // Permissions_assignment: "nav-link",
  // approving: "nav-link",
  // dashboard: "nav-link"
})

// The nav-link items active status handling function
const pageActice = function () {
if (route.path == '/') {
    active.value.main = 'nav-link active'
  } else if (route.path == '/viewpredict') {
    active.value.predict = 'nav-link active'
  } else if (route.path == '/selectstock') {
    active.value.selectstock = 'nav-link active'
  }else if (route.path == '/selectrating') {
    active.value.selectrating = 'nav-link active'
  } else if (route.path == '/forecast') {
    active.value.forecast = 'nav-link active'
  }
  
}

// System Logout Function
const logout = function () {
  localStorage.removeItem('token')
  alert('You have been logged out')
  router.push('/')
}

onMounted(() => {
  pageActice()
 
})


</script>

<template>
  <nav class="navbar navbar-expand-lg navigation-clean bg-body-tertiary">
    <div class="container-fluid">
      <a class="navbar-brand" v-if="userRole != 'admin'" href="/main">System</a>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <a :class="active.main" href="/">Main</a>

            <a :class="active.viewpridect" href="/viewpridect">viewpridect</a>
 
            <a :class="active.selectstock" href="/selectstock">selectstock</a>
            <a :class="active.selectrating" href="/selectrating">selectrating</a>
            <a :class="active.forecast" href="/forecast">forecast</a>
        </ul>
        <button type="button" class="btn btn-outline-danger" @click="logout">Sign Out</button>
      </div>
    </div>
  </nav>
</template>
