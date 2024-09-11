<script setup>
import NavBarView from '../components/NavBarView.vue';
import PDFViewer from 'pdf-viewer-vue'
// import { ref } from 'vue'
import { ref, onMounted, computed ,nextTick} from 'vue'
import 'bootstrap/dist/css/bootstrap.css'
import { useRoute, useRouter } from "vue-router";
import { jwtDecode } from "jwt-decode";
import VuePdfApp from '../components/viwer.vue';

const router = useRouter();
const route = useRoute();

var remaining_Day = ref('');

const form_info = ref({
  name: '',
  posit: '',
  dep: '',
  reason: '',
  application_date:"",
  date1: '',
  date2: '',
  team: '',
  terms: '',
  form_type:'',
  dept_unit_code:'',
  number_of_leaveDay : '',
  email:'',
  user_id:''
})

var form_type = ref('')

console.log(route.query.action)

const reject_application = async (application_id) => {
    try {
  
        // Get the token from local storage    
        const token = localStorage.getItem('token');

        // decode jwt token
        const decoded = jwtDecode(token);
  

        let user_id = `${decoded._id}`;
        var response = await fetch(`/api/reject_application?form_id=${application_id}&head_id=${user_id}&time=${new Date()}&form_type=${form_type.value}`, {
        method: 'PATCH'
            ,
              headers: {
                  Authorization: `Bearer ${token}`,
              }
          });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        // convert the response to json
        const json = await response.json();
        

        alert(json.message)
        router.go(-1);

    } catch (error) {
        console.log(error);
    }
};


const endorsing = async () => {
    try {
  
        // Get the token from local storage    
        const token = localStorage.getItem('token');

        // decode jwt token
        const decoded = jwtDecode(token);
  

        let user_id = `${decoded._id}`;
        var response ;
         let json ;
        if(route.query.action== "Endorsing"){
            response= await fetch(`/api/endorsing_application?form_id=${ route.params.application_id}&head_id=${user_id}&time=${new Date()}`, {
            method: 'PATCH'
            ,
            headers: {
                Authorization: `Bearer ${token}`,
            }
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }

            // convert the response to json
            json = await response.json();
            alert(json.message)
        }

        



        if(route.query.action== "Approving"){
            response= await fetch(`/api/approving_application?form_id=${ route.params.application_id}&current_id=${user_id}&time=${new Date()}&form_type=${form_type.value}`, {
            method: 'PATCH'
                ,
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }

 
            json = await response.json();

        

            alert(json.message)
        }

        // if(`${decoded.dept_unit_code}` =='Dean_Office_of_Science'&&`${decoded.position}` =='head' ){
        //     response= await fetch(`/api/approving_n_endorsing_application?form_id=${ route.params.application_id}&head_id=${user_id}&time=${new Date()}`, {
        //     method: 'PATCH'
        //         // ,
        //         // headers: {
        //         //     Authorization: `Bearer ${token}`,
        //         // }
        //     });
        //     if (!response.ok) {
        //         throw new Error(response.statusText);
        //     }

        //     // convert the response to json
        //     const json = await response.json();

        

        //     alert(json.message)
        // }
        


        router.go(-1);

    } catch (error) {
        console.log(error);
    }
};



async function get_Remaining_Day() {

var response = await fetch(`/api/Remaining_Day?_id=${form_info.value.user_id}`);

const json = await response.json();

remaining_Day.value= json.Remaining_Day;

}

async function download_Pdf() {
    await fetch(
      `http://localhost:5173/api/download_Pdf/${route.params.application_id}`,
      {
        method: "POST",
      }
    );
}



const get_application_record = async function () {

    const response = await fetch('/api/specific_application_record/' + route.params.application_id);

    const json = await response.json();



    form_info.value = json.specific_application_record ;
    form_info.value.application_date =  form_info.value.application_date .split(" ").slice(0,5).join(" ")
    console.log(form_info.value);
    get_Remaining_Day();
}

async function view() {
    fetch('/api/download_Pdf/' + route.params.application_id);
}


onMounted(async () => {
  const token = localStorage.getItem('token');

 form_type.value = localStorage.getItem('form_type');
 console.log(form_type.value)



  if(token){
    const decoded = jwtDecode(token);



 }


    if (route.params.application_id) {
      get_application_record();
      download_Pdf();


    }
});

</script>

<script>


import { useRouter, useRoute } from 'vue-router';

export default {
  data() {
    const router = useRouter();
    const route = useRoute();

    async function name() {
      const response = await fetch(`http://localhost:5173/api/get_all_file/${route.params.application_id}`);
      const json = await response.json();
      return json === "none" ? false : true;
    }

    return {
      showLink: false,
      downloadLink: `http://localhost:5173/api/downloadFile/minio/dir/${route.params.application_id}`,
    };
  },
  async created() {
    this.showLink = await this.name();
  },
  methods: {
    async name() {
      const response = await fetch(`http://localhost:5173/api/get_all_file/${this.$route.params.application_id}`);
      const json = await response.json();
      return json === "none" ? false : true;
    },
  },
};
</script>

<template>
    <main>
        <NavBarView></NavBarView>

        <div class="container">

            <div class="row" >
                <div  style="margin-top: 5%;">
                    <div class="card">
                    
                        <div class="row" style="padding-left: 1%; padding-right: 1%;">
                            <div class="col">
                            <div class="form-group ">
                                <label for="inputEmail3" class="col-sm-2 col-form-label">Name</label>
                                <div class="">
                                <input type="Name" class="form-control" id="inputEmail3" placeholder="" v-model="form_info.name">
                                </div>
                            </div>
                            <div class="form-group " >
                                <label for="inputPassword3" class="col-sm-2 col-form-label">Email</label>
                                <div class="col">
                                <input type="Email" class="form-control" id="inputPassword3" placeholder="" v-model="form_info.email">
                                </div>
                            </div>

                            <div class="form-group " >
                                <label for="inputEmail3" class="col-sm-2 col-form-label">Department</label>
                                <div class="col">
                                <input type="Name" class="form-control" id="inputEmail3" placeholder="" v-model="form_info.dept_unit_code">
                                </div>
                            </div>
                            <div class="form-group " >
                                <label for="inputPassword3" class="col-sm-2 col-form-label">Position</label>
                                <div class="col">
                                <input type="Email" class="form-control" id="inputPassword3" placeholder="" v-model="form_info.position">
                                </div>
                            </div>
                            <div class="form-group " >
                                <label for="inputPassword3" class="col-sm-6 col-form-label">Application Date</label>
                                <div class="col">
                                <input  class="form-control" id="inputPassword3" placeholder="" v-model="form_info.application_date">
                                </div>
                            </div>

                            
                        </div>


                        <div class="col">
                            <div class="form-group ">
                                <label for="exampleFormControlTextarea1" class="col-sm-2 col-form-label">Reason </label>
                                <textarea class="form-control" id="exampleFormControlTextarea1" rows="4" v-model="form_info.reason_statment"></textarea>
                            </div>
                            <div class="form-group " >
                                <label for="inputPassword3" class="col-sm-2 col-form-label">Day of Leave </label>
                                <div class="col">
                                <input type="Email" class="form-control" id="inputPassword3" placeholder="" v-model="form_info.number_of_leaveDay">
                                </div>
                            </div>

                            <div class="form-group " >
                                <label for="inputEmail3" class="col col-form-label">Remaining Day</label>
                                <div class="col">
                                <input type="Name" class="form-control" id="inputEmail3" placeholder="" v-model="remaining_Day">
                                </div>
                            </div>

                            <div class="form-group " >
                                <label for="inputEmail3" class="col col-form-label">Download File</label>
                                <div class="col">

                                    <span>
                                        <a v-if="showLink" :href="downloadLink" target="_blank">Download all files</a>
                                    </span>
                                </div>
                            </div>
                        </div>

                        

                        <div class="row" style="margin-top: 1%; margin-bottom: 1%;">
                            <div class="col-1" style="margin-bottom: 2%;">
                                <a  ><button type="button" @click="endorsing()" class="btn btn-primary">Approval</button></a>
                            </div>
                            <div class="col-md-1">
                                <button type="button" @click="reject_application(route.params.application_id)" class="btn btn-danger" >Reject</button>
                            </div>
                            <div class="col-1">
                               <a href="/PDF_viwer_"> <button type="button" class="btn btn-primary" @click="view()">View</button></a>

                            </div>
            
                        </div>

     
                       
                        </div>



                    </div>
                    
                </div>
                
            </div>
            
          </div>
    </main>

    
</template>

<script>

</script>