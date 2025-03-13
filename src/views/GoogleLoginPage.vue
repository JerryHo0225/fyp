
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const loading = ref(false)
const errorMessage = ref('')

const handleGoogleLogin = async () => {
  try {
    loading.value = true
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) throw error
    //ture to dashboard
    router.push('/selectstock')
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
  <main>
    <section class="vh-100 gradient-custom">
      <div class="container py-5 h-100">
        <div class="row d-flex justify-content-center align-items-center h-100">
          <div class="col-12 col-md-8 col-lg-6 col-xl-5">
            <div class="card bg-light text-white" style="border-radius: 1rem;">
              <div class="card-body p-5 text-center">
                <div class="mb-md-5 mt-md-1 pb-5">
                  <h2 class="fw-bold mb-3 text-uppercase text-start text-dark">Login with Google</h2>
                  <hr class="my-3 text-dark">
                  <div class="mb-3">
                    <v-btn
                      :loading="loading"
                      color="primary"
                      @click="handleGoogleLogin"
                      block
                    >
                      Login with Google
                    </v-btn>
                    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
}
</style>