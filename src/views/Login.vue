<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="text-h5">
            Sign In
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                required
                outlined
                prepend-icon="mdi-email"
              ></v-text-field>
              <v-btn
                :loading="loading"
                color="primary"
                type="submit"
                block
              >
                Send Magic Link
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const loading = ref(false)
const email = ref('')
const router = useRouter()

const handleLogin = async () => {
  try {
    loading.value = true
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
    })
    if (error) throw error
    // Display a success message using Vuetify snackbar
    successMessage.value = 'Check your email for the login link!'
    showSuccess.value = true
    // Optionally redirect to another page
    // router.push('/dashboard')
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message
      showError.value = true
    }
  } finally {
    loading.value = false
  }
}

const showSuccess = ref(false)
const successMessage = ref('')
const showError = ref(false)
const errorMessage = ref('')
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>