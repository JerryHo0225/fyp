<script setup>
import NavBarView from '../components/NavBarView.vue'
import { jwtDecode } from 'jwt-decode'
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const data = ref([])
const total = ref(0)
const loading = ref(false)
const sortField = ref('vote_count')
const sortOrder = ref('desc')
const defaultSortOrder = ref('desc')
const page = ref(1)
const perPage = ref(10)
const search = ref('')

const status = ref('')

const loadAsyncData = () => {
  recordType()
  //change here
  var userid = ''
  const token = localStorage.getItem('token')

  if (token) {
    const decoded = jwtDecode(token)
    userid = `${decoded._id}`
  }

  const params = [
    `type=${search.value}`,
    `sort_by=${sortField.value}.${sortOrder.value}`,
    `page=${page.value}`,
    `status=${status.value}`
  ].join('&')
  loading.value = true
  fetch(`/api/record/${userid}?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((result) => {
      total.value = result.total
      data.value = result.bookings
      console.log(total.value)
      loading.value = false
    })
    .catch((error) => {
      data.value = ['this']
      total.value = 0
      loading.value = false
      throw error
    })
}

const recordType = function () {
  if (route.name == 'endorsement-page') {
    status.value = 'endorsement'
  } else if (route.name == 'approved-page') {
    status.value = 'approved'
  } else if (route.name == 'rejected-page') {
    status.value = 'rejected'
  } else if (route.name == 'needinfo-page') {
    status.value == 'needinfo'
  }
}

const getDetailLink= function(formType, id) {
    return '/record/' + (formType === 'LVEF4' ? 'f4detail/' : 'f1detail/') + id;
  }
  
const onPageChange = (p) => {
  page.value = p
  loadAsyncData()
}

const onSort = (field, order) => {
  sortField.value = field
  sortOrder.value = order
  loadAsyncData()
}

onMounted(() => {
  loadAsyncData()
})

watch(() => search.value, () => {
  loadAsyncData()
})

</script>

<template>
  <main>
    <NavBarView :notiNum="1">

    </NavBarView>

    <div style="padding: 3rex">
      <div class="card">
        <h2 class="card-header" v-if="route.name == 'record-page'">All Application Record</h2>
        <h2 class="card-header" v-if="route.name == 'endorsement-page'">All Endorsement Record</h2>
        <h2 class="card-header" v-if="route.name == 'approved-page'">All Approved Record</h2>
        <h2 class="card-header" v-if="route.name == 'rejected-page'">All Rejected Record</h2>
        <h2 class="card-header" v-if="route.name == 'needinfo-page'">All Need Info Record</h2>
        <div class="card-body">
          <div class="row g-3">

            <div class="col-12">
              <div class="row g-3">
                <div class="col-12 col-md-3">
                  <div class="d-grid">
                    <form class="d-flex" role="search">
                      <div class="input-group">
                        <span class="input-group-text" id="basic-addon1">
                          <i class="bi bi-search"></i>
                        </span>
                        <input class="form-control" type="search" placeholder="Form Type" aria-label="Search"
                          aria-describedby="basic-addon1" v-model="search" />
                      </div>
                    </form>
                  </div>
                </div>

                <div class="d-none d-md-block col-md-7"></div>

                <div class="col-12 col-md-2">
                  <div class="d-grid">
                    <div class="input-group">
                      <span class="input-group-text" id="inputGroup-sizing-default">Total :</span>
                      <input class="form-control" type="text" value="Disabled readonly input"
                        aria-label="Disabled input example" v-model="total" disabled readonly>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div class="col-12">
              <section v-if="total">
                <o-table :data="data" :loading="loading" paginated backend-pagination :total="total" :per-page="perPage"
                  backend-sorting :default-sort-direction="defaultSortOrder" :current-page="page"
                  :default-sort="[sortField, sortOrder]" aria-next-label="Next page" aria-previous-label="Previous page"
                  aria-page-label="Page" aria-current-label="Current page" @sort="onSort"
                  @update:currentPage="onPageChange">
                  <o-table-column v-slot="props" field="number_of_leaveDay" label="Application Day" sortable>
                    {{ props.row.number_of_leaveDay ? props.row.number_of_leaveDay : 1 }}
                  </o-table-column>

                  <o-table-column v-slot="props" field="starting_date" label="Start Date" sortable centered>
                    {{ props.row.starting_date ? new Date(props.row.starting_date).toLocaleDateString() : 'DD/MM/YYYY'
                    }}
                  </o-table-column>

                  <o-table-column v-slot="props" field="ending_date" label="End Date" sortable centered>
                    {{ props.row.ending_date ? new Date(props.row.ending_date).toLocaleDateString() : 'DD/MM/YYYY' }}
                  </o-table-column>

                  <o-table-column v-slot="props" field="form_type" label="Application type">
                    {{ props.row.form_type ? props.row.form_type : 'ADO/LVE' }}
                  </o-table-column>

                  <o-table-column v-slot="props" field="form_type" label="Status">
                    <div v-if="props.row.endorsment_states == true">
                      Endorsement
                    </div>
                    <div v-else-if="props.row.approval_states == true">
                      Approval
                    </div>
                    <div v-else-if="props.row.reject_states == true">
                      Reject
                    </div>
                    <div v-else>
                      Padding
                    </div>
                  </o-table-column>
                  <o-table-column width="100" v-slot="props" >
                    <a :href="getDetailLink(props.row.form_type, props.row._id)">
                      <button type="button" class="btn btn-primary">
                        <div>
                          <span>Detail</span>
                        </div>
                      </button>
                    </a>
                  </o-table-column>
                </o-table>
              </section>
              <section v-else>
                <div class="alert alert-warning text-center" role="alert">
                  No record found
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
