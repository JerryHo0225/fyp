<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-title class="text-center">
            <span class="text-h5">Account Settings</span>
          </v-card-title> 
          
          <div class="d-flex justify-center align-center ma-2">
            <v-icon class="mr-2">mdi-account</v-icon>
            <v-chip 
              color="primary"
              label
              outlined
            >
              {{ userRole }}
            </v-chip>
          </div>
          
          <v-card-text>
            <v-form @submit.prevent="updateProfile">
              <v-text-field
                label="Email"
                :value="session.user.email"
                prepend-icon="mdi-email"
              ></v-text-field>
              <v-text-field
                label="Name"
                v-model="username"
                outlined
                prepend-icon="mdi-account"
                :rules="[v => !!v || 'Name is required']"
              ></v-text-field>
              
              <!-- <v-text-field
                label="Website"
                v-model="website"
                outlined
                prepend-icon="mdi-web"
                :rules="[v => /^(https?:\/\/)?([\w.-]+)+(:\d+)?(\/([\w/_-]+)?)*$/.test(v) || 'Enter a valid URL']"
              ></v-text-field> -->
              
              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                block
                class="mt-4"
              >
                Update
              </v-btn>
              <!-- <v-btn
                color="secondary"
                @click="signOut"
                :disabled="loading"
                block
                class="mt-2"
              >
                Sign Out
              </v-btn> -->
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { supabase } from '../supabase'
import { onMounted, ref, toRefs, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps(['session'])
const { session } = toRefs(props)
const router = useRouter()

const loading = ref(false)
const username = ref('')
// const website = ref('')
const avatar_url = ref('')
const isanalyst = ref(false)

const userRole = computed(() => {
  return isanalyst.value ? 'Analyst' : 'Normal User'
})

onMounted(getProfile)

async function getProfile() {
  try {
    loading.value = true
    const { user } = session.value

    let { data, error, status } = await supabase
      .from('profiles')
      .select('username, avatar_url, isanalyst')
      .eq('id', user.id)
      .single()

    if (error && status !== 406) throw error

    if (data) {
      username.value = data.username
      // website.value = data.website
      avatar_url.value = data.avatar_url
      isanalyst.value = data.isanalyst || false
    }
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}

async function updateProfile() {
  try {
    loading.value = true
    const { user } = session.value

    const updates = {
      id: user.id,
      username: username.value,
      // website: website.value,
      avatar_url: avatar_url.value,
      updated_at: new Date(),
    }

    const { error } = await supabase.from('profiles').upsert(updates)
    if (error) throw error

    alert('Profile updated successfully!')
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.fill-height {
  min-height: 64vh;
}
.mt-4 {
  margin-top: 16px;
}
.mt-2 {
  margin-top: 8px;
}
.text-center {
  text-align: center;
}
</style>