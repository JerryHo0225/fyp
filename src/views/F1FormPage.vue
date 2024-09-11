<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { jwtDecode } from 'jwt-decode'
import FormData from 'form-data'
//const file = ref(null);
const router = useRouter()
const route = useRoute()
const recDay = new Date(route.params.date)
const user_id = ref('')
const result = ref(0)
const submit_status = ref(true)
var remaining_Day = ref('')
var startingDay = ref(0)
var tatol_application_Day = ref(0)

const formInfo = ref({
  name: '',
  position: '', // posit
  depCode: '', //dept_unit_code
  reason: '',

  caInfo: '',
  caDate: '',
  caOther: '',
  assignee: '',

  date1: '',
  date2: '',
  terms: '',
  numOfDay: '', //number_of_leaveDay

  numOftotalDay: '',

  userID: '', // user_id
  form_type: 'ADOHKF1',
  email: '',

  files: []
})
/*
//var fileIndex = 0;
function newFile(event) {
  //const fileInput = document.getElementById('file');
  file.value = event.target.files[0];
  ////filePath = extractFilePath(file);
  //fileArray.push(fileInput.files[0]);
}*/
/*
  const reader = new FileReader();
  console.log(reader.readAsText(file));

  reader.onload = function (event) {
    const fileContent = event.target.result;
    console.log(fileContent); // You can log the file content to the console
    // You can further process or display the file content as needed
  };

  reader.readAsText(file); // Read the file as text
*/

// Application form sumbit function

let selectedFiles = []
async function newFile(event) {
  //get file(s) from file ipnut
  //one of the example
  //   {
  //     "0": {name: 'xxx.pdf' , lastModifiedDate:"2024-04-08T16:09:15.613Z", type:"application/pdf"},
  //     "1": {name: 'xaxxaaa.pdf'},
  //     "2": {name: 'aaasf.jpeg'},
  //     "3": {name: 'xx232x.jpeg'}
  // }
  selectedFiles = event.target.files
}

//const submitFile = async function (event) {
// async function submitFile(event) {}

/*
async function uploadFiles(formData) {
  var url = '/api/uploadFile';
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    const json = await response.json();
    alert(JSON.stringify(json));
  } catch (error) {
    console.error('Error uploading files:', error);
  }
}
*/
const submit = async function () {
  submit_status.value = false
  var form = document.getElementById('form1')
  var calbtn = document.getElementById('cancel')
  var inputs = form.getElementsByTagName('input')
  var textareas = form.getElementsByTagName('textarea')
  calbtn.disabled = true
  for (var J = 0; J < inputs.length; J++) {
    inputs[J].disabled = true
  }
  for (var Y = 0; Y < textareas.length; Y++) {
    textareas[Y].disabled = true
  }

  let formData = new FormData()
  //get file(s) from selectedFiles
  for (var i = 0; i < selectedFiles.length; i++) {
    //append file
    //   {
    //     "0": {name: 'xxx.pdf' , lastModifiedDate:"2024-04-08T16:09:15.613Z", type:"application/pdf"},
    //     "1": {name: 'xaxxaaa.pdf'},
    //     "2": {name: 'aaasf.jpeg'},
    //     "3": {name: 'xx232x.jpeg'}
    // }
    formData.append('file', selectedFiles[i])

    console.log(selectedFiles[i])

  }

  // console.log(formData.getAll('file'))

  // JSON.stringify(formData.getAll('file'))

  // alert(formData)

  var url = '/api/formSubmit'
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formInfo.value)
  })
  //console.log("hello");
  //Send Notification Email to everyone
  // convert the response to json
  const json = await response.json()
  //console.log("hello2222");
  //event.preventDefault();

  update_Remaining_Day()


  /////////////////////////////////////////////
  //upload file
  if (selectedFiles.length > 0) {
    //console.log(formData.getAll('file'))

    try {
      var fileUrl = '/api/uploadFile/f1/' + json.values;

      const fileResponse = await fetch(fileUrl, {
        method: "POST",
        body: formData,
      });


      // var downloadFileUrl = '/api/downloadFile/' + json.values;

      // await fetch(downloadFileUrl, {
      //   method: "POST",
      //   body: formData,
      // });

      //console.log(formInfo.value.email);




      if (!fileResponse.ok) {
        // throw new Error('Failed to upload files.');
      }

      //const json = await fileResponse.json();

      //alert(JSON.stringify(json));
    } catch (error) {

      console.error('Error uploading files:', error);
    }

    // try {
    //   var emailUrl = '/api/emailapp/23212381@life.hkbu.edu.hk';
    //   const emailUrlRe = await fetch(emailUrl, {
    //     method: "POST",
    //     body: formData,
    //   });


    //   //const json = await fileResponse.json();

    //   //alert(JSON.stringify(json));
    // } catch (error) {

    //   console.error('Error uploading files:', error);
    // }
  }

  //email
  //   if (selectedFiles.length > 0) {



  // await fetch(
  //   `http://localhost:5173/api/emailapp/f1/${formInfo.value.email}`,
  //   {
  //     method: "POST",
  //     body: formData,
  //   }
  // );


  //   }else{ 





  await fetch(
    `http://localhost:5173/api/emailapp/onlypdf/f1/${formInfo.value.email}`,
    {
      method: "POST",
    }
  );

  alert("Your form is submitted")
  router.go(-1)


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

  formInfo.value.numOfDay = parseInt(resultV)
  formInfo.value.numOftotalDay = parseInt(totalApplyDay)

  return (document.getElementById('result').innerHTML = result.value = Math.floor(resultV))
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

    formInfo.value.name = `${decoded.ssoid}`
    formInfo.value.depCode = `${decoded.dept_unit_code}`
    formInfo.value.position = `${decoded.position}`
    formInfo.value.email = `${decoded.sso_email}`
    user_id.value = `${decoded._id}`
    formInfo.value.userID = user_id.value
  }
  get_Remaining_Day()
  get_tatol_application_Day()
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
          // headers: {
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

    <form class="row g-3" @submit.prevent="submit" enctype="multipart/form-data" id="form1">
      <div class="col-md-6">
        <label for="inputName" class="form-label">Name</label>
        <input v-model="formInfo.name" type="text" class="form-control" id="inputName" placeholder="Name" required />
      </div>

      <div class="col-md-6">
        <label for="inputPost" class="form-label">Position</label>
        <input v-model="formInfo.position" type="text" class="form-control" id="inputPost" placeholder="Position"
          required />
      </div>

      <div class="col-12">
        <label id="labelBlock" for="inputDep" class="form-label">Faculty / School / Department</label>
        <input v-model="formInfo.depCode" type="text" class="form-control" id="inputDep"
          placeholder="BOIL/CHEM/COMP/MATH/PHYS/DEAN" required />
      </div>

      <div class="col-12">
        <label for="reasonText" class="form-label">
          Please state the assigned duties and attach relevant supporting document(s), if applicavle
        </label>
        <textarea v-model="formInfo.reason" rows="5" cols="50" class="form-control" id="reasonText">
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
            <textarea v-model="formInfo.caInfo" rows="5" cols="50" class="form-control" id="classText">
            </textarea>
          </div>

          <div class="col-md-4">
            <label for="dateText" class="form-label"> Date(s)/Period </label>
            <textarea v-model="formInfo.caDate" rows="5" cols="50" class="form-control" id="dateText">
            </textarea>
          </div>

          <div class="col-md-4">
            <label for="arrText" class="form-label"> Make-up Class/Other Arrangements </label>
            <textarea v-model="formInfo.caOther" rows="5" cols="50" class="form-control" id="arrText">
            </textarea>
          </div>
        </div>
      </div>

      <div class="col-12">
        <label id="labelBlock" for="inputPeople" class="form-label">During my absce, will act on my behalf. (if
          applicable)</label>
        <input v-model="formInfo.assignee" type="text" class="form-control" id="inputPeople"
          placeholder="Name of assignee" />
      </div>

      <div class="col-12">
        <div class="row g-3">
          <div class="col-md-2">
            <label for="dateNum" type="number" class="form-label">No. of Days</label>
            <input type="text" class="form-control" id="result" v-model="formInfo.numOfDay" disabled />
          </div>

          <div class="col-md-4">
            <label class="form-label">Start Of Leave From</label>
            <input v-model="formInfo.date1" :min="new Date().toISOString().slice(0, 16)" type="datetime-local"
              class="form-control" id="inputDate1" @change="dateCal()" required />
          </div>

          <div class="col-md-6">
            <label class="form-label">Total Supporting Document(s):</label>
            <input class="form-control" @change="newFile($event)" type="file" id="file" name="filename"
              accept="image/png, image/jpeg,.pdf,.word" multiple />
          </div>

          <div class="col-12">
            <div class="row g-3">
              <div class="col-md-2">
                <label for="totalNum" type="number" class="form-label">Total Leave Days</label>
                <input type="text" class="form-control" id="totalResult" v-model="formInfo.numOftotalDay" disabled />
              </div>

              <div class="col-md-4">
                <label class="form-label">End Of Leave To</label>
                <input v-model="formInfo.date2" type="datetime-local" class="form-control" id="inputDate2"
                  :min="new Date().toISOString().slice(0, 16)" @change="dateCal()" required />
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="form-check">
              <input v-model="formInfo.terms" class="form-check-input" type="checkbox" id="gridCheck" required />
              <label class="form-check-label" for="gridCheck">
                Agree to terms and conditions
              </label>
            </div>
          </div>

          <div class="col-12">
            <div class="row g-3">
              <div class="col-12 col-md-2">
                <div class="d-grid">
                  <button v-if="submit_status" class="btn btn-lg btn-primary" type="submit">Submit</button>
                  <button v-else class="btn btn-lg btn-primary" disabled="">
                    <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                    <span role="status"> Loading...</span>
                  </button>
                </div>
              </div>

              <div class="d-none d-md-block col-md-8"></div>

              <div class="col-12 col-md-2">
                <div class="d-grid">
                  <button class="btn btn-lg btn-danger d-block" type="button" id="cancel" @click="$router.go(-1)">
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

    <LoadingPage></LoadingPage>
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
