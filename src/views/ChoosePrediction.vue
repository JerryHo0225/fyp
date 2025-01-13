<template>
  <div class="page-wrapper">
    <NavBarView />
    <main class="content">
      <v-container>
        <v-form @submit.prevent="submitForm">
          <v-text-field
            v-model="company"
            label="Company"
            placeholder="Enter stock ticker symbol (e.g., AAPL)"
            required
          ></v-text-field>
          <v-select
            v-model="timeDiffValue"
            :items="timeDiffOptions"
            label="Time Difference Unit"
            required
          ></v-select>
          <v-select
            v-model="modelType"
            :items="modelTypeOptions"
            label="Model Type"
            required
          ></v-select>

          <p>add future result</p>
          <v-btn type="submit" color="primary">Predict</v-btn>
        </v-form>
      </v-container>
    </main>
    <Footer />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavBarView from '@/components/NavBarView.vue'
import Footer from '@/components/Footer.vue'

const router = useRouter()
const company = ref('AAPL')
const timeDiffValue = ref('hours')
const modelType = ref('LinearRegression')

const timeDiffOptions = ['days', 'hours']
//const timeDiffOptions = ['days', 'hours', 'minutes'];
const modelTypeOptions = ['RandomForestRegressor', 'LSTM', 'LinearRegression']

// const modelTypeOptions = [
//   'RandomForestRegressor',
//   'ExtraTreesRegressor',
//   'XGBRegressor',
//   'LinearRegression',
//   'KNeighborsRegressor',
//   'LSTM'
// ];

const submitForm = () => {
  router.push({
    name: 'viewpridect',
    query: {
      company: company.value,
      time_diff_value: timeDiffValue.value,
      model_type: modelType.value
    }
  })
}
</script>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
}

.container {
  max-width: 800px;
  margin: auto;
}
</style>
