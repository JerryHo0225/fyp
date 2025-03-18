<script setup>
import { supabase } from '@/supabase'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userEmail = ref(null)
const loading = ref(true)

const getCurrentUser = async () => {
  try {
    const { data } = await supabase.auth.getSession()

    console.log('User session data:', data.session.user.email)

    return data.session.user.email
  } catch (error) {
    console.error('Error getting user session:', error)
  }
}

const checkEmail = async () => {
  console.log('Page Active')

  const email = await getCurrentUser()

  const response = await fetch(`/api/auth/user/check/${email}`)

  const result = await response.json()

  const exist_value = result.exists

  if (exist_value) {
    console.log('User exists:', result.user_id)
    // Redirect to home or dashboard
    router.push('/dashboard')
  } else {
    console.log('User does not exist in the database:', email)
    
    // Instead of creating the user automatically, redirect to registration page
    router.push({
      path: '/register',
      query: { email: email } // Pass the email as a query parameter
    })

    /* 
    // Previous automatic user creation code
    const { data } = await supabase.auth.getSession()
    console.log(data , 'User data');
    
    const response1 = await fetch(`/api/auth/user/create`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    console.log(response1, 'User updated')
    */
  }
}

onMounted(async () => {
  try {
    userEmail.value = await getCurrentUser()
    checkEmail()
  } catch (error) {
    console.error('Error in mounted hook:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div id="app">
    <main>
      <div>
        <div v-if="loading">Loading data...</div>
        <div v-else>User email: {{ userEmail || 'Not logged in' }}</div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* The background color control of the whole website background-color: #6a94e2; */
html,
body,
main {
  min-height: 100vh;
}
</style>
