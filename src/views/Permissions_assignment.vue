<script setup>
import NavBarView from '../components/NavBarView.vue';
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from "vue-router";
import { jwtDecode } from "jwt-decode";

const router = useRouter();
const route = useRoute();

var isHead = ref('');
var Department_code= ref('')
var current_user= ref('')
onMounted(() => {
    const token = localStorage.getItem('token');
    if(token){
        const decoded = jwtDecode(token);
        isHead.value = `${decoded.position}`;
        current_user.value =  `${decoded._id}`;
        Department_code.value =  `${decoded.dept_unit_code}`;
    }
    if(!token || isHead.value !="head" ){
        alert("Unauthorized user access");
        router.push('/main');
    }
    get_all_member_function()
    get__all_selected_user_function()


})




const Cancel_selected_user = async (user_id) => {
    try {
  
        // Get the token from local storage    
        const token = localStorage.getItem('token');

        // decode jwt token
        const decoded = jwtDecode(token);
  

        var response = await fetch(`/api/Cancel_selected_user?selected_user=${user_id}`, {
        method: 'PATCH'
            // ,
              // headers: {
              //     Authorization: `Bearer ${token}`,
              // }
          });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        // convert the response to json
        const json = await response.json();
     
        get__all_selected_user_function()
        get_all_member_function()

        alert(json.message)


    } catch (error) {
        console.log(error);
    }
};



const select_user = async (user_id) => {
    try {
  
        // Get the token from local storage    
        const token = localStorage.getItem('token');

        // decode jwt token
        const decoded = jwtDecode(token);
  

        var response = await fetch(`/api/select_user?selected_user=${user_id}`, {
        method: 'PATCH'
            // ,
              // headers: {
              //     Authorization: `Bearer ${token}`,
              // }
          });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        // convert the response to json
        const json = await response.json();
        

        get_all_member_function()
        get__all_selected_user_function()

        alert(json.message)


    } catch (error) {
        console.log(error);
    }
};


const get__member_info = ref({
    _id:'',
    sso_email: '',
    ssoid: '',
    employee_type: '',
    dept_unit_code: '',
    name: '',
    position: '',
    Remaining_Day:'',
    number_of_max_leave_days:'',
    position:''
})


const get_all_member_list_pages= ref({
  current:1,
  perPage:3,
  totals:0
})

async function get_all_member_function(page=1) {
    get_all_member_list_pages.value.current=page;
  console.log(get_all_member_list_pages.value.current[1]);
  var response = await fetch(`/api/get_all_member_function?Department_code=${Department_code.value}&current_user=${current_user.value}&page=${page}`);

  const json = await response.json();

  get__member_info.value = json.user_records;
  console.log(get__member_info.value)

  get_all_member_list_pages.value.perPage = json.perPage;
  get_all_member_list_pages.value.totals = json.totals;
  console.log( json.totals  )
}


const get__all_selected_user = ref({
    _id:'',
    sso_email: '',
    ssoid: '',
    employee_type: '',
    dept_unit_code: '',
    name: '',
    position: '',
    Remaining_Day:'',
    number_of_max_leave_days:'',
    position:''
})


const get__all_selected_user_list_pages= ref({
  current:1,
  perPage:3,
  totals:0
})

async function get__all_selected_user_function(page=1) {
    get__all_selected_user_list_pages.value.current=page;
  console.log(get__all_selected_user_list_pages.value.current[1]);
  var response = await fetch(`/api/get__all_selected_user_function?Department_code=${Department_code.value}&current_user=${current_user.value}&page=${page}`);

  const json = await response.json();

  get__all_selected_user.value = json.user_records;
  console.log(get__all_selected_user.value)

  get__all_selected_user_list_pages.value.perPage = json.perPage;
  get__all_selected_user_list_pages.value.totals = json.totals;
  console.log( json.totals  )
}




</script>

<template>
    <main>
        <NavBarView></NavBarView>

        <div class="container">

            <div class="row">
                <div class="col-12" style="margin-top: 5%;">
                    <div class="card">
                        <div class="row">

                            <div class="col-12"  style="margin-top: 2%; padding-left: 5%; padding-right: 5%;">
                                <h4>Please select below user for delegating </h4>
                                <table class="table table-hover">
                                    <thead>
                                        <tr >
        
                                            <th scope="col">Name</th>
                                    
                                            <th scope="col">Department</th>
                                            <th scope="col">Position</th>
                                            <th scope="col">Option</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="i in get__member_info"  >
                                            <td>{{i.name}}</td>
                                            <td>{{ i.dept_unit_code }}</td>
                                            <td>{{ i.position }}</td>
                                            <td><button  @click="select_user(i._id)" type="button"
                                                        class="btn btn-primary">Select</button></td>
                                        </tr>

                                    </tbody>
                                </table>
                            </div>
                        </div>


                        <nav aria-label="Page navigation example" style="margin-top: 2%; margin-right: 3%;">
                            <ul class="pagination justify-content-end">
                                <li class="page-item disabled" v-if="get_all_member_list_pages.current==1">
                                    <a class="page-link" @click="get_all_member_function(get_all_member_list_pages.current-1)">Previous</a>
                                </li>
                                <li class="page-item " v-if="get_all_member_list_pages.current>1">
                                    <a class="page-link" @click="get_all_member_function(get_all_member_list_pages.current-1)">Previous</a>
                                </li>
                                <li  v-for="page in  Math.ceil(get_all_member_list_pages.totals/get_all_member_list_pages.perPage)" class="page-item">
                                    <a   @click="get_all_member_function(page)" class="page-link" v-if="get_all_member_list_pages.current!=page" >{{ page }}</a>
                                    <a  style="color: darkgray;"  class="page-link" v-if="get_all_member_list_pages.current==page" >{{ page }}</a>
                                </li>
                                <li class="page-item">
                                    <a class="page-link" @click="get_all_member_function(get_all_member_list_pages.current+1)">Next</a>
                                </li>
                            </ul>
                        </nav>




                    </div>
                </div>
            </div>
        </div>









        <div class="container">
            <div class="row">
                <div class="col-12" style="margin-top: 5%;">
                    <div class="card">
                        <div class="row">

                            <div class="col-12" style="margin-top: 2%; padding-left: 5%; padding-right: 5%;">
                                <h4>List of user was delegated </h4>
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
            
                                            <th scope="col">Name</th>
              
                                            <th scope="col">Department</th>
                                            <th scope="col">Position</th>
                                            <th scope="col">Option</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="i in get__all_selected_user"  >
                                            <td>{{i.name}}</td>
                                            <td>{{ i.dept_unit_code }}</td>
                                            <td>{{ i.position }}</td>
                                            <td><button  @click="Cancel_selected_user(i._id)" type="button"
                                                        class="btn btn-danger">Cancel</button></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>


                        <nav aria-label="Page navigation example" style="margin-top: 2%; margin-right: 3%;">
                            <ul class="pagination justify-content-end">
                                <li class="page-item disabled" v-if="get__all_selected_user_list_pages.current==1">
                                    <a class="page-link" @click="get__all_selected_user_function(get__all_selected_user_list_pages.current-1)">Previous</a>
                                </li>
                                <li class="page-item " v-if="get__all_selected_user_list_pages.current>1">
                                    <a class="page-link" @click="get__all_selected_user_function(get__all_selected_user_list_pages.current-1)">Previous</a>
                                </li>
                                <li  v-for="page in  Math.ceil(get__all_selected_user_list_pages.totals/get__all_selected_user_list_pages.perPage)" class="page-item">
                                    <a   @click="get__all_selected_user_function(page)" class="page-link" v-if="get__all_selected_user_list_pages.current!=page" >{{ page }}</a>
                                    <a  style="color: darkgray;"  class="page-link" v-if="get__all_selected_user_list_pages.current==page" >{{ page }}</a>
                                </li>
                                <li class="page-item">
                                    <a class="page-link" @click="get__all_selected_user_function(get__all_selected_user_list_pages.current+1)">Next</a>
                                </li>
                            </ul>
                        </nav>



                    </div>
                </div>
            </div>
    </div>
</main></template>

<script>

</script>