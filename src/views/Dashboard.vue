<style>
.container {
  max-width: 800px;
  margin: auto;
}
canvas {
  max-width: 100%;
  height: 400px; /* Ensure the height is set */
}
</style>

<script setup>
import { onMounted, ref } from 'vue'
import Account from '@/components/Account.vue'
import Auth from '@/components/Auth.vue'
import { supabase } from '@/supabase'
import NavBarView from '@/components/NavBarView.vue'
import Footer from '@/components/Footer.vue'

const session = ref()

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })

  supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session
  })
})
</script>

<template>
  <NavBarView />
  <div class="container" style="padding: 50px 0 100px 0">
    <Account v-if="session" :session="session" />
    <Auth v-else />
  </div>
  <Footer></Footer>
</template>
