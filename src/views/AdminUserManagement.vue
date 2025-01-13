<template>
  <div>
    <NavBarView />
    <div class="container mt-4">
      <h2>User Role Management</h2>
      <div v-if="users.length === 0" class="alert alert-info">
        No other users found
      </div>
      <div v-else class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.isanalyst ? 'Analyst' : 'Normal User' }}</td>
              <td>
                <button 
                  class="btn btn-primary"
                  @click="toggleUserRole(user.id, user.isanalyst)"
                  :disabled="loading"
                >
                  Switch to {{ user.isanalyst ? 'Normal User' : 'Analyst' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import NavBarView from '../components/NavBarView.vue'

const users = ref([])
const loading = ref(false)
const currentUser = ref(null)

async function fetchUsers() {
  try {
    loading.value = true
    
    // Get current user first
    const { data: { session } } = await supabase.auth.getSession()
    currentUser.value = session?.user?.id

    // Fetch all users except current user
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', currentUser.value) // Exclude current user
    
    if (error) throw error
    users.value = data || []
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

async function toggleUserRole(userId, currentRole) {
  try {
    loading.value = true
    const { error } = await supabase
      .from('profiles')
      .update({ isanalyst: !currentRole })
      .eq('id', userId)

    if (error) throw error
    await fetchUsers() // Refresh the list
  } catch (error) {
    console.error('Error updating user role:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.container {
  padding: 20px;
}
</style>