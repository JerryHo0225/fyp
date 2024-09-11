<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { jwtDecode } from "jwt-decode";

const token = localStorage.getItem('token');
const userRole = ref("");

const route = useRoute();
const router = useRouter();

const info = ref({
    email: '',
    pwd: '',
    name: '',
})

// Submit the admin user information to the backend
const submitAdmin = async function () {
    var url = '/api/users/create/admin';
    var method = 'POST';

    if (route.params.id) {
        url = `/api/users/edit/admin/${route.params.id}`;
        method = 'PATCH';
    }

    const response = await fetch(url, {
        method: method,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(info.value)
    });
    const json = await response.json();
    console.log(json);
    alert(JSON.stringify(json));
    router.go(-1);
}

// Load the admin user information from the backend
const loadAdminData = async function () {
    var url = `/api/users/admin/${route.params.id}`;
    var method = 'GET';

    const response = await fetch(url, {
        method: method,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const json = await response.json();
    info.value = json;

}

onMounted(async () => {
    if (token) {
        const decoded = jwtDecode(token);
        userRole.value = decoded.role;
    }
    if (token == null || userRole.value != "admin") {
        alert(" Unauthorized access ");
        router.go(-1);
    }
    if (route.params.id) {
        loadAdminData();
    }
});

</script>

<template>
    <div style="padding: 7rex;"></div>
    <div class="container">
        <h1 v-if="route.name == 'admin-new'">
            Create a new admin user
        </h1>
        <h1 v-else>
            Edit admin user information
        </h1>
        <div style="padding: 3rex;"></div>
        <form class="row g-3" @submit.prevent="submitAdmin">
            <div class="col-12">
                <label for="inputAddress" class="form-label">Name</label>
                <input type="text" class="form-control" id="adName" placeholder="Name" v-model="info.name">
            </div>
            <div class="col-md-6">
                <label for="inputEmail" class="form-label">Email</label>
                <input type="email" class="form-control" id="adEmail" placeholder="example@gmail.com"
                    v-model="info.email">
            </div>
            <div class="col-md-6">
                <label for="inputPassword" class="form-label">Password</label>
                <input type="password" class="form-control" id="adPwd" v-model="info.pwd">
                <div id="passwordHelpBlock" class="form-text">
                    Your password must be 8 to 13 characters long, a combination of
                    uppercase letters, lowercase letters, numbers,
                    and symbols
                </div>
            </div>
            <div class="col-12">
            </div>
            <div class="col-12">
                <div class="row g-3">
                    <div class="col-12 col-md-2">
                        <div class="d-grid">
                            <button v-if="route.name == 'admin-new'" type="submit"
                                class="btn btn-primary">Create</button>
                            <button v-if="route.name == 'admin-edit'" type="submit"
                                class="btn btn-primary">Edit</button>
                        </div>
                    </div>
                    <div class="d-none d-md-block col-md-8"></div>
                    <div class="col-12 col-md-2">
                        <div class="d-grid">
                            <button class="btn btn-danger d-block" type="button" @click="$router.go(-1)">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>