<script setup>
import { onMounted, ref, watch } from 'vue'
//import { useRouter, useRoute } from 'vue-router'
import { useRoute } from 'vue-router'
import { jwtDecode } from 'jwt-decode'

const file = ref(null)
//const router = useRouter()
const route = useRoute()
const recDay = new Date(route.params.date)
const user_id = ref('')
const result = ref(0)
let isEditMode = ref(false)
var remaining_Day = ref('')
var startingDay = ref(0)
var tatol_application_Day = ref(0)
var file1 =ref('')
var file2 =ref('')
var file3 =ref('')
var file4 =ref('')
var file5 =ref('')

const formInfo = ref({
  name: '',
  postion: '',
  dept_unit_code: '',
  reason_statment: '',
  team: '',
  terms: '',
  form_type: '',
  number_of_leaveDay: '',
  class_assignment_info: '',
  class_assignment_period: '',
  other_arrangements: '',
  endorsing_by_Head:null,
  approving_by_dean:null
})


const get_application_record = async function () {
  const response = await fetch('/api/specific_application_record/' + route.params.application_id)
  const json = await response.json()
  formInfo.value = json.specific_application_record
  get_Remaining_Day();
}

function get_all_files() {
      //const router = useRouter();
   

      
//    var response = await fetch(`/api/get_all_file/${route.params.application_id}`)
//    const json = await response.json()

// console.log(json.result);

//   file1.value = json.result.file_1
//   file2.value = json.result.file_2
//   file3.value = json.result.file_3
//   file4.value = json.result.file_4
//   file5.value = json.result.file_5
  
//   console.log("231111111111111");

 
  }

// File upload function
watch(file, async (newValue) => {
  const formData = new FormData()
  formData.append('file', newValue)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })
  const json = await response.json()
  alert(JSON.stringify(json))
})

// Application form update function
const Update = async function () {
  if (window.confirm('Are you sure you want to update the application?') == false)
  return
  isEditMode.value = !isEditMode.value
  var form = document.getElementById('form1')
  var inputs = form.getElementsByTagName('input')
  var textareas = form.getElementsByTagName('textarea')
  for (var i = 0; i < inputs.length; i++) {
      inputs[i].disabled = true
  }
  for (var Y = 0; Y < textareas.length; Y++) {
    textareas[Y].disabled = true
  }
 
  
  var url = `/api/update/${route.params.application_id}`
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formInfo.value)
    
  })

  //Send Notification Email to everyone
  // convert the response to json
  const json = await response.json()
  console.log(formInfo.value)
  // alert the user
  //update_Remaining_Day()
  alert(JSON.stringify(json))
}

function handleButtonClick() {
  if(isEditMode.value) {
    Update();
  }else{
    Edit();
  }
  
}
const editcancel = function () {
  location.reload();
  document.template.focus();
}
// Calculate the number of leave days
function dateCal() {
  get_tatol_application_Day()
  var d1 = document.getElementById('inputDate1').value
  var d2 = document.getElementById('inputDate2').value

  var date1 = new Date(d1)
  var date2 = new Date(d2)

  var time_difference = date2.getTime() - date1.getTime()
  var resultV = time_difference / (1000 * 60 * 60 * 24)
  // var totalApplyDay = 21 - remaining_Day.value + resultV
  var totalApplyDay = resultV + tatol_application_Day.value

  formInfo.value.numOfDay = resultV
  formInfo.value.numOftotalDay = totalApplyDay

  return (document.getElementById('result').innerHTML = result.value = Math.floor(resultV))
}

function Edit() {
  isEditMode.value = !isEditMode.value
  var form = document.getElementById('form1')
  var inputs = form.getElementsByTagName('input')
  var textareas = form.getElementsByTagName('textarea')
  for (var i = 0; i < inputs.length; i++) {
    if (
      inputs[i].id != 'result' &&
      inputs[i].id != 'totalResult' &&
      inputs[i].id != 'inputDate1' &&
      inputs[i].id != 'inputDate2'
    )
      inputs[i].disabled = false
  }
  for (var Y = 0; Y < textareas.length; Y++) {
    textareas[Y].disabled = false
  }
}
function shouldDisableButton(){
  console.log(this.formInfo.endorsing_by_Head);
  console.log(this.formInfo.approving_by_dean);
  if (this.formInfo.endorsing_by_Head !== null ||
      this.formInfo.approving_by_dean !== null ||
    this.formInfo.reject_time !== null){
        console.log(123); 
        return true;
      }else{
        console.log(456); 
        return false;

      }
  }
// Get the remaining days of the user
onMounted(() => {
  // if (remaining_Day = 21){

  // }
  if (recDay) {
    const date = new Date(recDay)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')

    startingDay.value = `${year}-${month}-${day}T${hour}:${minute}`
    formInfo.value.date1 = startingDay.value
  }

  const token = localStorage.getItem('token')
  if (token) {
    const decoded = jwtDecode(token)

    formInfo.value.name = `${decoded.name}`
    formInfo.value.depCode = `${decoded.dept_unit_code}`
    formInfo.value.position = `${decoded.position}`
    formInfo.value.email = `${decoded.sso_email}`
    user_id.value = `${decoded._id}`
    formInfo.value.userID = user_id.value
    
  }
  get_Remaining_Day()
  
  get_tatol_application_Day()
  if (route.params.application_id) {
    get_application_record()
    get_all_files()
  }
})

async function get_tatol_application_Day() {
  var response = await fetch(`/api/get_tatol_application_Day?_id=${user_id.value}`)

  const json = await response.json()

  tatol_application_Day.value = json.get_tatol_application_Day
}

// Get the remaining days of the user
async function get_Remaining_Day() {
  var response = await fetch(`/api/Remaining_Day?_id=${user_id.value}`)
  const json = await response.json()

  remaining_Day.value = json.Remaining_Day
}

// Update the remaining days of the user

const update_Remaining_Day = async () => {
  try {
    get_Remaining_Day()
    // Get the token from local storage
    // const token = localStorage.getItem('token');

    // decode jwt token
    // const decoded = jwtDecode(token);

    remaining_Day.value = remaining_Day.value - formInfo.value.numOfDay
    if (remaining_Day.value < 0) {
      remaining_Day.value = 0
    }
    if (remaining_Day.value >= 0) {
      var response = await fetch(
        `/api/update_Remaining_Day?_id=${user_id.value}&number_of_leaveDay=${remaining_Day.value}`,
        {
          method: 'PATCH'
          // ,
          // dateNum: {
          //     Authorization: `Bearer ${token}`,
          // }
        }
      )

      if (!response.ok) {
        throw new Error(response.statusText)
      }

      // convert the response to json
      // const json = await response.json();
    }
    // alert("You enrolled a event")
  } catch (error) {
    console.log(error)
  }
}




//tentative
// const approver = ref(true);
</script>

<script>
import { useRouter, useRoute } from 'vue-router';

export default {
  
  data() {
    const router = useRouter();
    const route = useRoute();
    
    return {


      texts: [
        { id: 1, content: 'No file is uploaded' },
        // Add more text objects as needed
      ],
    };
  },
  async created() {
    this.texts = await this.get_all_files();
  },
  methods:{
    async get_all_files() {
    
      
   var response = await fetch(`/api/get_all_file/${this.$route.params.application_id}`)
   const json = await response.json()

const length = Object.keys(json.result).length;

console.log(length);

const jsonArray = [
  
]

for (let index = 0; index < length - 2; index++) {
  jsonArray[index] = {
      id: (index + 1),
      content: "",
    }
    
    
  }

for (let index = 0; index < length - 2; index++) {
    const text = "file_" + (index + 1)

    const key = json.result[text]

    console.log(key);
  
    jsonArray[index].id = index + 1

    jsonArray[index].content = key
}



//console.log(jsonArray)

  //console.log("231111111111111");

  return jsonArray
 }
  }
};
</script>

<template>
  <div style="padding-top: 5rex"></div>
  <div class="container">
    <h1>
      Application for Assigned Duty outside Hong Kong
      <br />被指派於香港以外工作申請表
    </h1>

    <h2 class="text-center">
      The application arrangement is to record the approved duties outside Hong Kong that staff
      members are required to undertake as part of their work.
      <br />此安排為方便大學記錄同事履行被指派於香港以外的工作。
    </h2>

    <form class="row g-3" @submit.prevent="submit" id="form1">
      <div class="col-md-6">
        <label for="inputName" class="form-label">Name</label>
        <input
          v-model="formInfo.name"
          type="text"
          class="form-control"
          id="inputName"
          placeholder="Name"
          required
          disabled
        />
      </div>
      
      <div class="col-md-6">
        <label for="inputPost" class="form-label">Position</label>
        <input
          v-model="formInfo.position"
          type="text"
          class="form-control"
          id="inputPost"
          placeholder="Position"
          required
          disabled
        />
      </div>

      <div class="col-12">
        <label id="labelBlock" for="inputDep" class="form-label"
          >Faculty / School / Department</label
        >
        <input
          v-model="formInfo.dept_unit_code"
          type="text"
          class="form-control"
          id="inputDep"
          placeholder="BOIL/CHEM/COMP/MATH/PHYS/DEAN"
          required
          disabled
        />
      </div>

      <div class="col-12">
        <label for="reasonText" class="form-label">
          Please state the assigned duties and attach relevant supporting document(s), if applicavle
        </label>
        <textarea
          v-model="formInfo.reason_statment"
          rows="5"
          cols="50"
          class="form-control"
          id="reasonText"
          disabled
        >
        </textarea>
      </div>

      <div class="col-12">
        <label for="classText" class="form-label">
          Proposed arrangement for classes and other important assignments while away from campus
          (if applicable)
        </label>
        <div class="row g-3">
          <div class="col-md-4">
            <label for="classText" class="form-label"> Class/Assignment Details </label>
            <textarea
              v-model="formInfo.class_assignment_info"
              rows="5"
              cols="50"
              class="form-control"
              id="classText"
              disabled
            >
            </textarea>
          </div>

          <div class="col-md-4">
            <label for="dateText" class="form-label"> Date(s)/Period </label>
            <textarea
              v-model="formInfo.class_assignment_period"
              rows="5"
              cols="50"
              class="form-control"
              id="dateText"
              disabled
            >
            </textarea>
          </div>

          <div class="col-md-4">
            <label for="arrText" class="form-label"> Make-up Class/Other Arrangements </label>
            <textarea
              v-model="formInfo.other_arrangements"
              rows="5"
              cols="50"
              class="form-control"
              id="arrText"
              disabled
            >
            </textarea>
          </div>
        </div>
      </div>

      <div class="col-12">
        <label id="labelBlock" for="inputPeople" class="form-label"
          >During my absce, will act on my behalf. (if applicable)</label
        >
        <input
          v-model="formInfo.assignee"
          type="text"
          class="form-control"
          id="inputPeople"
          placeholder="Name of assignee"
          disabled
        />
      </div>

      <div class="col-12">
        <div class="row g-3">
          <div class="col-md-2">
            <label for="dateNum" type="number" class="form-label">No. of Days</label>
            <input
              type="text"
              class="form-control"
              id="result"
              v-model="formInfo.number_of_totayDay"
              disabled
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Start Of Leave From</label>
            <input
              v-model="formInfo.starting_date"
              type="datetime-local"
              class="form-control"
              id="inputDate1"
              @change="dateCal()"
              required
              disabled
            />
          </div>

            <div class="col-md-6">
            <label class="form-label">File List</label>
            <input
              class="form-control"
              type="file"
              id="file"
              name="filename"
              accept="image/png, image/jpeg,.pdf,.word"
              multiple
              disabled
            />
           

            <div>
    <span v-for="text in texts" :key="text.id" id="passwordHelpInline" class="form-text">

                    {{ text.content + " | " }}
            </span>
    
  </div>
          </div>

          

          <div class="col-12">
            <div class="row g-3">
              <div class="col-md-2">
                <label for="totalNum" type="number" class="form-label">Total Leave Days</label>
                <input
                  type="text"
                  class="form-control"
                  id="totalResult"
                  v-model="formInfo.number_of_totayDay"
                  disabled
                />
              </div>

              

              <div class="col-md-4">
                <label class="form-label">End Of Leave To</label>
                <input
                  v-model="formInfo.ending_date"
                  type="datetime-local"
                  class="form-control"
                  id="inputDate2"
                  @change="dateCal()"
                  required
                  disabled
                />
              </div>

            
            </div>

            
          </div>

          <div class="col-12">
            <div class="form-check">
              <input
                v-model="formInfo.terms"
                class="form-check-input"
                type="checkbox"
                id="gridCheck"
                required
                disabled
              />
              <label class="form-check-label" for="gridCheck">
                Agree to terms and conditions
              </label>
            </div>
          </div>

          <div class="col-12">
            <div class="row g-3">
              <div class="col-12 col-md-2">
                <div class="d-grid">

                  <button
                    v-if="!isEditMode"
                    type="button"
                    class="btn btn-lg btn-primary"
                    @click="handleButtonClick"
                    :disabled="shouldDisableButton()"
                  >
                    Edit
                  </button>
                  <button
                    v-else
                    type="button"
                    class="btn btn-lg btn-primary"
                    @click="handleButtonClick"
                    :disabled="shouldDisableButton()"
                  >
                    Update
                  </button>
                </div>
              </div>

              <div class="d-none d-md-block col-md-8"></div>

              <div class="col-12 col-md-2">
                <div class="d-grid">
                  <button
                    v-if="!isEditMode"
                    class="btn btn-lg btn-danger d-block"
                    type="button"
                    @click="$router.go(-1)"
                  >
                    Back
                  </button>
                  <button
                    v-else
                    type="button"
                    class="btn btn-lg btn-danger d-block"
                    @click="editcancel()"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style="padding-bottom: 5rex"></div>
        </div>
      </div>
    </form>
  </div>
  <div style="padding-bottom: 5rex"></div>
</template>

<style scoped>
h1 {
  text-align: center;
}

h2 {
  margin-top: 1rem;
  line-height: 1;
  font-size: 20px;
  margin-bottom: 2rem;
}

#container {
  height: 800px;
  width: 1000px;
  border: 4px solid;
  margin: 100px 0px 0px 100px;
}
</style>
