<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { jwtDecode } from 'jwt-decode'

// const needHandle = inject('needHandle')

const router = useRouter()
const route = useRoute()

const token = localStorage.getItem('token')

const userRole = ref()
const userPosition = ref()
const userDepCode = ref()
const userID = ref()

const notification = ref({
  endorsment: 0,
  approved: 0,
  rejected: 0,
  needinfo: 0,
  needhandle: 0
})

// The nav-link items active status handling
const active = ref({
  viewchart: 'nav-link',
main: "nav-link",
  // record: "nav-link",
  // endorsement: "nav-link",
  // approvaled: "nav-link",
  // reject: "nav-link",
  // need_info: "nav-link",
  // admin: "nav-link",
  // admin_management: "nav-link",
  // Permissions_assignment: "nav-link",
  // approving: "nav-link",
  // dashboard: "nav-link"
})

// The nav-link items active status handling function
const pageActice = function () {
  if (route.path == '/viewchart') {
    active.value.viewchart = 'nav-link active'
  } else if (route.path == '/') {
    active.value.main = 'nav-link active'
  } else if (route.path == '/record') {
    active.value.record = 'nav-link active'
  } else if (route.path == '/record/endorsement') {
    active.value.endorsement = 'nav-link active'
  } else if (route.path == '/record/approved') {
    active.value.approvaled = 'nav-link active'
  } else if (route.path == '/record/rejected') {
    active.value.reject = 'nav-link active'
  } else if (route.path == '/record/needinfo') {
    active.value.need_info = 'nav-link active'
  } else if (route.path == '/admin/portal') {
    active.value.admin = 'nav-link active'
  } else if (route.path == '/admin/manage') {
    active.value.admin_management = 'nav-link active'
  } else if (route.path == '/dashboard') {
    active.value.dashboard = 'nav-link active'
  }
}

const loadEndorsNotify = () => {
  if (token) {
    const decoded = jwtDecode(token)
    var userid = `${decoded._id}`
  }
  fetch(`/api/record/${userid}?&status=endorsement`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((result) => {
      notification.value.endorsment = result.total
    })
    .catch((error) => {
      notification.value.endorsment.value = 0
      throw error
    })
}

const loadApproveNotify = () => {
  if (token) {
    const decoded = jwtDecode(token)
    var userid = `${decoded._id}`
  }
  fetch(`/api/record/${userid}?&status=approved`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((result) => {
      notification.value.approved = result.total
    })
    .catch((error) => {
      notification.value.approved.value = 0
      throw error
    })
}

const loadRejectNotify = () => {
  if (token) {
    const decoded = jwtDecode(token)
    var userid = `${decoded._id}`
  }
  fetch(`/api/record/${userid}?&status=rejected`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((result) => {
      notification.value.rejected = result.total
    })
    .catch((error) => {
      notification.value.rejected.value = 0
      throw error
    })
}

const loadNeedInfoNotify = () => {
  if (token) {
    const decoded = jwtDecode(token)
    var userid = `${decoded._id}`
  }
  fetch(`/api/record/${userid}?&status=needinfo`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((result) => {
      notification.value.needinfo = result.total
    })
    .catch((error) => {
      notification.value.needinfo.value = 0
      throw error
    })
}

const loadNeedhandleNotify = () => {
  notification.value.needhandle = localStorage.getItem('needEndors')

  // let form1handle
  // form1handle = fetch(`/api/endorse_application_records_on_endosement_states?dept_unit_code=${userDepCode.value}&page=1&current_user=${userID.value}&action=${"Endorsing"}`);
  // var f1Json = form1handle.json();
  // notification.value.needhandle = f1Json.total;

  // if (notification.value.needhandle == 0) {
  //     let form1handleEndorsing = fetch(`/api/approve_application_records_on_approving_states?page=1&current_user=${userID.value}&action=Endorsing&form_type=${"ADOHKF1"}`);
  //     var f1JsonEndorsing = form1handleEndorsing.json();
  //     let form1handleApproving = fetch(`/api/approve_application_records_on_approving_states?page=1&current_user=${userID.value}&action=Approving&form_type=${"ADOHKF1"}`);
  //     var f1JsonApproving = form1handleApproving.json();
  //     notification.value.needhandle = f1JsonEndorsing.total + f1JsonApproving.total;
  // }

  // let form2handleEndorsing = fetch(`/api/approve_application_records_on_approving_states?page=1&current_user=${userID.value}&action=Endorsing&form_type=${"LVEF4"}`);
  // var f2JsonEndorsing = form2handleEndorsing.json();
  // let form2handleApproving = fetch(`/api/approve_application_records_on_approving_states?page=1&current_user=${userID.value}&action=Approving&form_type=${"LVEF4"}`);
  // var f2JsonApproving = form2handleApproving.json();
  // notification.value.needhandle = f1Json.total + f2JsonEndorsing.total + f2JsonApproving.total;
}

// System Logout Function
const logout = function () {
  localStorage.removeItem('token')
  alert('You have been logged out')
  router.push('/')
}

onMounted(() => {
  pageActice()
  if (token) {
    const decoded = jwtDecode(token)
    userID.value = decoded._id
    userRole.value = decoded.role
    userPosition.value = decoded.position
    userDepCode.value = `${decoded.dept_unit_code}`
  }
  if (userPosition.value == 'Dean' || userPosition.value == 'head') {
    loadNeedhandleNotify()
  }
  loadEndorsNotify()
  loadApproveNotify()
  loadRejectNotify()
  loadNeedInfoNotify()
})


</script>

<template>
  <nav class="navbar navbar-expand-lg navigation-clean bg-body-tertiary">
    <div class="container-fluid">
      <a class="navbar-brand" v-if="userRole != 'admin'" href="/main">System</a>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <a :class="active.main" href="/">Main</a>
          
            <a :class="active.viewchart" href="/viewchart">viewchart</a>
          
 

        </ul>
        <button type="button" class="btn btn-outline-danger" @click="logout">Sign Out</button>
      </div>
    </div>
  </nav>
</template>
