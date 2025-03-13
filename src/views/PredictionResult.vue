<template>
  <v-container>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <h2>Prediction Results for {{ company }}</h2>
      <v-card>
        <v-card-title>Validation Table</v-card-title>
        <v-card-text>
          <p><strong>All Close:</strong> {{ validationTable.All_Close }}</p>
          <p><strong>Close:</strong> {{ validationTable.Close }}</p>
          <p><strong>Predictions:</strong> {{ validationTable.Predictions }}</p>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'PredictionResult',
  setup() {
    const route = useRoute()
    const isLoading = ref(true)
    const error = ref<string | null>(null)
    const company = ref(route.query.company as string)
    const validationTable = ref({
      All_Close: {},
      Close: {},
      Predictions: {}
    })

    const fetchPrediction = async () => {
      try {
        const response = await fetch(`/api/predict/train`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            company: company.value,
            time_diff_value: route.query.time_diff_value,
            model_type: route.query.model_type
          })
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        validationTable.value = data.validation_table
        console.log(data);
        
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'An error occurred'
      } finally {
        isLoading.value = false
      }
    }

    onMounted(fetchPrediction)

    return {
      isLoading,
      error,
      company,
      validationTable
    }
  }
})
</script>

<style scoped>
/* Add any necessary styles here */
</style>