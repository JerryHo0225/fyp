<script setup>
import CalendarView from '../components/CalendarView.vue'
import NavBarView from '../components/NavBarView.vue'

import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { jwtDecode } from 'jwt-decode'

const router = useRouter()
const route = useRoute()

// Ogura Table Variable Declaration
const data = ref([])
const total = ref(0)
const loading = ref(false)
const perPage = ref(5)
const user_id = ref('')
const status = ref('')

const pageTage = ref({
  approved: "nav-link",
  rejected: "nav-link",
  needinfo: "nav-link"
})

var remaining_Day = ref(21)
var tatol_application_Day = ref(0)

var name = ref('')
var position = ref('')
var Department_code = ref('')

const tageOnClick = function () {
  if (route.name == 'main-page') {
    pageTage.value.approved = 'nav-link active'
  } else if (route.name == 'main-page-record-rejected') {
    pageTage.value.rejected = 'nav-link active'
  } else if (route.name == 'main-page-record-needinfo') {
    pageTage.value.needinfo = 'nav-link active'
  }
}

const recordType = function () {
  if (route.name == 'main-page') {
    status.value = 'approved'
  } else if (route.name == 'main-page-record-rejected') {
    status.value = 'rejected'
  } else if (route.name == 'main-page-record-needinfo') {
    status.value == 'needinfo'
  }
}

async function get_Remaining_Day() {
   var response = await fetch(`/api/Remaining_Day?_id=${user_id.value}`)
   const json = await response.json()
   console.log(json.Remaining_Day)
   if (json.Remaining_Day != null) {
     remaining_Day.value = json.Remaining_Day
   } else {
     remaining_Day.value = 21
   }
 }
 async function get_tatol_application_Day() {
   var response = await fetch(`/api/get_tatol_application_Day?_id=${user_id.value}`)
   const json = await response.json()
   tatol_application_Day.value = parseInt(json.get_tatol_application_Day)
 }

// Ogura Table Function
const loadAsyncData = () => {
  recordType()
  const params = [
    `status=${status.value}`
  ].join('&')
  loading.value = true
  fetch(`/api/record/${user_id.value}?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((result) => {
      total.value = result.total
      data.value = result.bookings
      loading.value = false
    })
    .catch((error) => {
      data.value = ['this']
      total.value = 0
      loading.value = false
      throw error
    })
}

/* Type style in relation to the value */
onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    const decoded = jwtDecode(token)
    user_id.value = `${decoded._id}`
    name.value = `${decoded.ssoid}`
    position.value = `${decoded.position}`
    Department_code.value = `${decoded.dept_unit_code}`
    loadAsyncData()
    get_Remaining_Day()
    get_tatol_application_Day()
    tageOnClick()
  }
})
</script>

<template>
  <main>
    <NavBarView></NavBarView>

    <div class="container">
      <div class="row g-4" style="padding-top: 3rex">
        <div class="col-md-4">
          <div class="card" style="height: 350px">
            <div class="card-body text-center">
              <h3 style="padding: 5px 0px 5px 0px">Name: {{ name }}</h3>
              <h4 style="padding: 5px 0px 5px 0px">Position: {{ position }}</h4>
              <h4 style="padding: 5px 0px 5px 0px">Department Unit Code: {{ Department_code }}</h4>
            </div>
          </div>

          <div style="padding-top: 3rex"></div>

          <div class="card">
            <div class="card-body text-center">
              <div class="row">
                <h3 style="padding: 5px 0px 5px 0px">Apply Quickly</h3>
                <div class="col d-grid">
                  <button type="button" class="btn btn-primary btn-lg" @click="router.push('/form/f1')">
                    Apply F1
                  </button>
                </div>
                <div class="col d-grid" v-if="position == 'Teaching Assist' || 'Teaching Staff' || 'Instructor' || 'Professor'">
                  <button type="button" class="btn btn-primary btn-lg" @click="router.push('/form/f4')">
                    Apply F4
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-8">
          <CalendarView style="height: 506px;" />
        </div>
      </div>

      <div class="row g-4" style="padding-top: 3rex">
        <div class="col-md-4">
          <div class="card" style="height: 462px">
            <div class="card-body">
              <div class="table-responsive fs-1 text-center">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Application Day</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{{ tatol_application_Day }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="table-responsive fs-1 text-center">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Remaining Day</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{{ remaining_Day }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-8">
          <div class="card text-center">
            <div class="card-header">
              <ul class="nav nav-tabs card-header-tabs">
                <li class="nav-item">
                  <a :class="pageTage.approved" href="/main">Approved</a>
                </li>
                <li class="nav-item">
                  <a :class="pageTage.rejected" href="/main/record/rejected">Rejected</a>
                </li>
                <li class="nav-item">
                  <a :class="pageTage.needinfo" href="/main/record/needinfo">Need info</a>
                </li>
              </ul>
            </div>

            <div class="card-body">
              <section v-if="total" style="height: 378px">
                <o-table :data="data" :loading="loading" :total="total" :per-page="perPage">

                  <o-table-column v-slot="props" field="number_of_leaveDay" label="Application Day" width="150">
                    {{ props.row.number_of_leaveDay ? props.row.number_of_leaveDay : 1 }}
                  </o-table-column>

                  <o-table-column v-slot="props" field="starting_date" label="Start Date">
                    {{ props.row.starting_date ? new Date(props.row.starting_date).toLocaleDateString() : 'DD/MM/YYYY'
                    }}
                  </o-table-column>

                  <o-table-column v-slot="props" field="ending_date" label="End Date">
                    {{ props.row.ending_date ? new Date(props.row.ending_date).toLocaleDateString() : 'DD/MM/YYYY' }}
                  </o-table-column>

                  <o-table-column v-slot="props" field="form_type" label="Application type" width="150">
                    {{ props.row.form_type ? props.row.form_type : 'ADO/LVE' }}
                  </o-table-column>

                </o-table>
              </section>

              <section v-else>
                <div class="alert alert-warning" role="alert" style="height: 362px">
                  No record found
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>

      <div style="padding-top: 3rex"></div>

    </div>
  </main>
</template>
