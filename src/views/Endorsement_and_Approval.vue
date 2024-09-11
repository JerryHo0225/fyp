<script setup>
import NavBarView from '../components/NavBarView.vue';

import { onMounted, ref } from 'vue'
import { useRouter } from "vue-router";
import { jwtDecode } from "jwt-decode";
import { provide } from 'vue'

const router = useRouter();

var form_type = ref('ADOHKF1')
var action = ref('Endorsing')

var position = ref('');
var Department_code = ref('')
var current_user = ref('')
var departments_of_faculty = []

const application_info = ref({
    _id: '',
    starting_date: '',
    ending_date: '',
    name: '',
    reason_statment: '',
    acting_Person: '',
    position: '',
    terms: '',
    form_type: '',
    number_of_leaveDay: '',
    dept_unit_code: ''
})

const approved_n_endorsed_application_info = ref({
    _id: '',
    starting_date: '',
    ending_date: '',
    name: '',
    reason_statment: '',
    acting_Person: '',
    position: '',
    terms: '',
    form_type: '',
    number_of_leaveDay: '',
    dept_unit_code: ''
})

const list_pages = ref({
    current: 1,
    // perPage: 3,
    totals: 0
})

const approved_n_endorsed_list_pages = ref({
    current: 1,
    perPage: 3,
    totals: 0
})

var unread_number_f1 = ref({
    totals: 0,
    comment: ''
})

var unread_number_f2 = ref({
    totals: 0
})

onMounted(() => {
    const token = localStorage.getItem('token');

    if (token) {
        const decoded = jwtDecode(token);
        position.value = `${decoded.position}`;
        Department_code.value = `${decoded.dept_unit_code}`;
        current_user.value = `${decoded._id}`;
        departments_of_faculty = `${decoded.departments_of_faculty}`;

    }

    if (!token || position.value != 'head') {
        if (position.value != 'team head') {
            if (position.value != 'Dean') {
                if (position.value != 'manager') {
                    if (position.value != 'Vice-President') {
                        if (position.value != 'President') {
                            if (position.value != 'Provost') {
                                alert("Unauthorized user access");
                                router.push('/');
                            }
                        }
                    }
                }
            }
        }
    }
    select_action()
    select_form_type()
    get_waiting_endorsing_or_approving();
    get_endorseed_or_approved();
    get_number_of_recorde_awaiting_f1()
    get_number_of_recorde_awaiting_f2()
});


// localStorage.setItem('action', route.params.token);

function select_action() {
    localStorage.setItem('action', action.value);
    action.value = localStorage.getItem('action');
    console.log(action.value)
    get_waiting_endorsing_or_approving();
    get_endorseed_or_approved();
}

// async function is_subHead() {

//     var response = await fetch(`/api/is_subHead?current_user=${current_user.value}`);

//     const json = await response.json();

//     if (json.is_subHead == false) {


//         return true

//     }

// }

async function get_waiting_endorsing_or_approving(page = 1) {
    list_pages.value.current = page;
    var response;

    // endorser for department head or dean

    if (action.value == 'Endorsing') {

        response = await fetch(`/api/endorse_application_records_on_endosement_states?dept_unit_code=${Department_code.value}&page=${page}&current_user=${current_user.value}&action=${action.value}`);

    }


    if (action.value == 'Approving') {
        response = await fetch(`/api/approve_application_records_on_approving_states?page=${page}&current_user=${current_user.value}&action=${action.value}&form_type=${form_type.value}`);
    }

    // if(Department_code.value.includes( "Dean")&& position.value =="head"){
    // response = await fetch(`/api/get_waiting_approve_n_endorsment_application_records?page=${page}&current_user=${current_user.value}`);
    // }

    const json = await response.json();

    application_info.value = json.application_records;

    // list_pages.value.perPage = json.perPage;
    list_pages.value.totals = json.totals;

    provide(/* key */ 'needHandle', /* value */ list_pages.value.totals)
    localStorage.setItem('needEndors', list_pages.value.totals);

}

async function get_endorseed_or_approved(page = 1) {
    approved_n_endorsed_list_pages.value.current = page;
    var response
    var json;

    if (action.value == "Endorsing") {
        response = await fetch(`/api/endorsed_application_records_on_endosement_states?dept_unit_code=${Department_code.value}&page=${page}&current_user=${current_user.value}&action=${action.value}`);
        json = await response.json();


    }
    if (action.value == "Approving") {
        response = await fetch(`/api/approved_application_records_on_approval_states?dept_unit_code=${Department_code.value}&page=${page}&current_user=${current_user.value}&action=${action.value}&form_type=${form_type.value}`);
        json = await response.json();
    }
    //     if(Department_code.value.includes( "Dean")&& position.value =="head"){
    //    response = await fetch(`/api/approved_n_endorsed_application_records?dept_unit_code=${Department_code.value}&page=${page}&current_user=${current_user.value}`);
    //     }

    approved_n_endorsed_application_info.value = json.application_records;


    // approved_n_endorsed_list_pages.value.perPage = json.perPage;
    approved_n_endorsed_list_pages.value.totals = json.totals;
}



const cancel_approved_or_endorsed_application = async (application_id) => {
    try {

        // Get the token from local storage    
        const token = localStorage.getItem('token');

        // decode jwt token
        const decoded = jwtDecode(token);


        let user_id = `${decoded._id}`;
        var response
        var json

        if (action.value == "Endorsing") {
            response = await fetch(`/api/reject_endorsement__application?form_id=${application_id}&head_id=${user_id}&time=${new Date()}`, {
                method: 'PATCH'
                ,
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }


        }



        if (action.value == "Approving") {
            response = await fetch(`/api/reject_approval__application?form_id=${application_id}&current_user=${user_id}&time=${new Date()}&form_type=${form_type.value}`, {
                method: 'PATCH'
                ,
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
        }

        // if(Department_code.value.includes( "Dean")&& position.value =="head"){
        // response = await fetch(`/api/reject_approved_n_endorsed__application?form_id=${application_id}&head_id=${user_id}&time=${new Date()}`, {
        // method: 'PATCH'
        // ,
        // headers: {
        //     Authorization: `Bearer ${token}`,
        // }
        //   });
        // }

        // convert the response to json
        json = await response.json();
        get_waiting_endorsing_or_approving();
        get_endorseed_or_approved();
        get_number_of_recorde_awaiting_f1()
        get_number_of_recorde_awaiting_f2()

        alert(json.message)
        router.go(0);




    } catch (error) {
        console.log(error);
    }
};

function select_form_type() {
    localStorage.setItem('form_type', form_type.value);
    form_type.value = localStorage.getItem('form_type');

    if (form_type.value == 'LVEF4') {
        action.value = 'Approving'
        localStorage.setItem('action', action.value);
        action.value = localStorage.getItem('action');

    }
    get_waiting_endorsing_or_approving();
    get_endorseed_or_approved();

}



async function get_number_of_recorde_awaiting_f1(page = 1) {
    let response;
    response = await fetch(`/api/endorse_application_records_on_endosement_states?dept_unit_code=${Department_code.value}&page=${page}&current_user=${current_user.value}&action=${"Endorsing"}`);
    var json = await response.json();
    unread_number_f1.value.totals = json.totals
    unread_number_f1.value.comment = ""
    console.log(json.totals)

    if (unread_number_f1.value.totals == 0) {
        response = await fetch(`/api/approve_application_records_on_approving_states?page=${page}&current_user=${current_user.value}&action=${action.value}&form_type=${"ADOHKF1"}`);
        json = await response.json();
        unread_number_f1.value.totals = json.totals
        if (unread_number_f1.value.totals != 0) {
            unread_number_f1.value.comment = ""
        } else {
            unread_number_f1.value.comment = ""
        }

    }

    console.log(json.totals);
}



async function get_number_of_recorde_awaiting_f2(page = 1) {
    let response;

    response = await fetch(`/api/approve_application_records_on_approving_states?page=${page}&current_user=${current_user.value}&action=${action.value}&form_type=${"LVEF4"}`);
    var json = await response.json();
    unread_number_f2.value.totals = json.totals

    console.log(json.totals);
}

</script>

<template>
    <main>
        <NavBarView></NavBarView>

        <div style="padding: 3rex">

            <div class="card">
                <h2 class="card-header" v-if="action == 'Endorsing'">List of applications awaiting endorsement</h2>
                <h2 class="card-header" v-if="action == 'Approving'">List of applications awaiting approval</h2>

                <div class="card-body">
                    <div class="col-12">
                        <div class="row g-3">

                            <div class="col-12 col-md-3">
                                <div class="d-grid">
                                    <form class="d-flex" role="search">
                                        <div class="input-group">
                                            <span class="input-group-text" id="basic-addon1">
                                                <i class="bi bi-search"></i>
                                            </span>
                                            <input class="form-control" type="search" placeholder="Form Type"
                                                aria-label="Search" aria-describedby="basic-addon1" v-model="search" />
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div class="col-12 col-md-5">
                                <div class="d-grid">
                                    <div class="btn-group" role="group" aria-label="Basic radio toggle button group">
                                        <input @change="select_form_type()" v-model="form_type" value="ADOHKF1"
                                            type="radio" class="btn-check" name="btnradio" id="btnradio1"
                                            autocomplete="off">
                                        <label class="btn btn-outline-primary btn btn-light" for="btnradio1">ADOHKF1
                                            <span
                                                class="position-absolute top-0 start-0 translate-middle badge rounded-pill bg-danger">
                                                {{ unread_number_f1.totals + " " + unread_number_f1.comment }}
                                                <span class="visually-hidden">unread messages</span>
                                            </span>
                                        </label>

                                        <input @change="select_form_type()" type="radio" class="btn-check"
                                            v-model="form_type" name="btnradio" value="LVEF4" id="btnradio2"
                                            autocomplete="off">
                                        <label class="btn btn-outline-primary btn btn-light" for="btnradio2">LVEF4
                                            <span
                                                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                                {{ unread_number_f2.totals }}
                                                <span class="visually-hidden">unread messages</span>
                                            </span>
                                        </label>

                                    </div>
                                </div>
                            </div>

                            <div class="col-12 col-md-4" v-if="form_type != 'LVEF4'">
                                <select @change="select_action()" v-model="action" class="form-select"
                                    aria-label="Default select example">
                                    <option value="Endorsing" selected>Endorsing</option>
                                    <option value="Approving">Approving</option>
                                </select>
                            </div>

                        </div>
                    </div>

                    <div class="col-12">
                        <table class="table table-striped" style="margin-left: -1;">
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Department</th>
                                    <!-- <th scope="col">Form Type</th> -->
                                    <th scope="col">Approval</th>

                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="i in application_info" :key="i.id">
                                    <td>{{ i.name }}</td>
                                    <td>{{ i.dept_unit_code }}</td>
                                    <!-- <td>{{ i.form_type }}</td> -->
                                    <td>
                                        <a
                                            v-bind:href="'/Endorsement_and_Approval_detail/' + i._id + `?action=${action}`">
                                            <button type="button" class="btn btn-primary">Detail</button>
                                        </a>
                                    </td>
                                </tr>
                                <tr v-if="!(application_info[0])">
                                    <td  style="text-align: center; vertical-align: middle;" colspan="3">Empty</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>

        <div style="padding: 0rex 3rex 3rex 3rex">

            <div class="card">

                <h2 class="card-header" v-if="action == 'Endorsing'">List of endorsed applications</h2>
                <h2 class="card-header" v-if="action == 'Approving'">List of approved applications</h2>

                <div class="card-body">

                    <div class="col-12">
                        <table class="table table-striped">
                            <thead>
                                <tr>

                                    <th scope="col">Name</th>
                                    <th scope="col">Department</th>
                                    <!-- <th scope="col">Form Type</th> -->
                                    <th scope="col">Approval</th>

                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="i in approved_n_endorsed_application_info" :key="i.id">
                                    <td>{{ i.name }}</td>
                                    <td>{{ i.dept_unit_code }}</td>
                                    <!-- <td>{{ i.form_type }}</td> -->
                                    <td><a v-bind:href="'/Endorsement_and_Approval_detail/' + i._id"><button
                                                type="button" class="btn btn-primary">Detail</button></a>
                                        <button @click="cancel_approved_or_endorsed_application(i._id)" type="button"
                                            class="btn btn-danger" style="margin-left: 1%;">Cancel</button>
                                    </td>
                                </tr>
                                <tr v-if="!(approved_n_endorsed_application_info[0])">
                                    <td  style="text-align: center; vertical-align: middle;" colspan="3">Empty</td>
                                </tr>
                            </tbody>
                        </table>

                        <nav aria-label="Page navigation example" style="margin-top: 2%; margin-right: 3%;">
                            <ul class="pagination justify-content-end">
                                <li class="page-item disabled" v-if="approved_n_endorsed_list_pages.current == 1">
                                    <a class="page-link"
                                        @click="get_endorseed_or_approved(list_pages.current - 1)">Previous</a>
                                </li>
                                <li class="page-item " v-if="approved_n_endorsed_list_pages.current > 1">
                                    <a class="page-link"
                                        @click="get_endorseed_or_approved(approved_n_endorsed_list_pages.current - 1)">Previous</a>
                                </li>
                                <li v-for="page in  Math.ceil(approved_n_endorsed_list_pages.totals / approved_n_endorsed_list_pages.perPage)"
                                    class="page-item" :key="page">
                                    <a @click="get_endorseed_or_approved(page)" class="page-link"
                                        v-if="approved_n_endorsed_list_pages.current != page">{{ page }}</a>
                                    <a style="color: darkgray;" class="page-link"
                                        v-if="approved_n_endorsed_list_pages.current == page">{{ page }}</a>
                                </li>
                                <li class="page-item">
                                    <a class="page-link"
                                        @click="get_endorseed_or_approved(approved_n_endorsed_list_pages.current + 1)">Next</a>
                                </li>
                            </ul>
                        </nav>

                    </div>

                </div>
            </div>

        </div>

    </main>
</template>