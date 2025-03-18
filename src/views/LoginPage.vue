<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const isSignup = ref(false)
const showCredentials = ref(false)

// Add check for existing session on mount
onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  if (data.session) {
    router.push('/selectstock')
  }
})

const handleLogin = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    
    if (error) throw error
    console.log('Login successful:', data)
    router.push('/dashboard')
  } catch (error) {
    console.error('Login error:', error)
    if (error instanceof Error) {
      errorMessage.value = error.message
    }
  } finally {
    loading.value = false
  }
}

const handleSignup = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    
    if (error) throw error

    // Create profile for new user
    if (data?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: data.user.id,
            email: data.user.email,
            isanalyst: false,
            isAdmin: false,
            username: data.user.email
          }
        ])
      
      if (profileError) throw profileError
    }

    router.push('/dashboard')
  } catch (error) {
    console.error('Error:', error)
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    loading.value = true
    const { data,error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/middleware`
      }
    })    

    if (error) throw error
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>{{ isSignup ? 'Sign Up' : 'Login' }}</h2>
        </div>
        <div class="login-body">
          <button class="google-login-btn mb-4" @click="handleGoogleLogin">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" />
            {{ isSignup ? 'Sign Up with Google' : 'Login with Google' }}
          </button>
          
          <div class="divider mb-4">OR</div>
          
          <v-form @submit.prevent="isSignup ? handleSignup() : handleLogin()">
            <v-btn
              color="secondary"
              block
              class="mb-4"
              @click="showCredentials = !showCredentials"
            >
              {{ showCredentials ? 'Hide' : 'Login with email and password' }}
            </v-btn>
            <div v-if="showCredentials">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                required
                outlined
                prepend-icon="mdi-email"
                class="custom-input"
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                required
                outlined
                prepend-icon="mdi-lock"
                class="custom-input"
              ></v-text-field>
              <v-btn
                :loading="loading"
                color="primary"
                type="submit"
                block
              >
                {{ isSignup ? 'Sign Up' : 'Login' }}
              </v-btn>
            </div>
            <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
          </v-form>
          <div class="toggle-link-container">
            <p>Don't have an account? <router-link to="/signup" class="toggle-link">Sign Up</router-link></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.login-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.login-body {
  display: flex;
  flex-direction: column;
}

.custom-input {
  background-color: #fff;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 15px;
  color: #000;
  font-size: 16px;
}

.google-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
  cursor: pointer;
  font-size: 16px;
  color: #757575;
  width: 100%;
}

.google-login-btn img {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.google-login-btn:hover {
  background-color: #f5f5f5;
}

.error-message {
  color: red;
  margin-top: 10px;
}

.toggle-link-container {
  text-align: center;
  margin-top: 16px;
}

.toggle-link {
  color: #1976D2;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
}

.toggle-link:hover {
  text-decoration: underline;
}

.mb-4 {
  margin-bottom: 16px;
}

.divider {
  text-align: center;
  position: relative;
  color: #757575;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background-color: #ddd;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}
</style>