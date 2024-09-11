<script setup>
import NavBarView from '../components/NavBarView.vue';

import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { jwtDecode } from "jwt-decode";

const token = localStorage.getItem('token');
const userRole = ref("");

const router = useRouter();
const route = useRoute();

const active = ref({
    all: "nav-link",
    active: "nav-link",
    disactive: "nav-link",
})

const sortStatus = ref();
const adData = ref({
    status: false,
})

const search = ref("");
const data = ref([]);
const total = ref(0);
const loading = ref(false);
const sortField = ref("ssoid");
const sortOrder = ref("desc");
const defaultSortOrder = ref("desc");
const page = ref(1);
const perPage = ref(10);

const pageActice = function () {
    if (route.name == 'admin-manage') {
        active.value.all = "nav-link active";
    } else if (route.name == 'admin-manage-active') {
        active.value.active = "nav-link active";
    } else if (route.name == 'admin-manage-disavitve') {
        active.value.disactive = "nav-link active";
    }
}

// Load all admin users data from the backend
const loadAdminData = () => {
    if (route.name == 'admin-manage-active') {
        sortStatus.value = true;
    } else if (route.name == 'admin-manage-disavitve') {
        sortStatus.value = false;
    } else {
        sortStatus.value = '';
    }
    const params = [
        `userEmail=${search.value}`,
        `sort_by=${sortField.value}.${sortOrder.value}`,
        `page=${page.value}`,
        `status=${sortStatus.value}`,
    ].join("&");
    loading.value = true;
    var url = `/api/users/alladmin?${params}`;
    fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then((response) => response.json())
        .then((result) => {
            let currentTotal = result.total;
            total.value = currentTotal;
            data.value = result.admins.map((item) => {
                return item;
            });
            loading.value = false;
        })
        .catch((error) => {
            data.value = [];
            total.value = 0;
            loading.value = false;
            throw error;
        });
};

// Active or disactive a admin user account
const verifyStauts = async function (email, cur) {
    var url = `/api/users/update/admin/status/${email}`;
    var method = 'PATCH';

    if (cur == false) {
        adData.value.status = true;
        const response = await fetch(url, {
            method: method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adData.value)
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const json = await response.json();
        alert(JSON.stringify(json));
    } else if (cur == true) {
        adData.value.status = false;
        const response = await fetch(url, {
            method: method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adData.value)
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const json = await response.json();
        alert(JSON.stringify(json));
    }
    loadAdminData();
}

const onPageChange = (p) => {
    page.value = p;
    loadAdminData();
};
const onSort = (field, order) => {
    sortField.value = field;
    sortOrder.value = order;
    loadAdminData();
};

onMounted(() => {
    if (token) {
        const decoded = jwtDecode(token);
        userRole.value = decoded.role;
    }
    if (token == null || userRole.value != "admin") {
        alert(" Unauthorized access ");
        router.go(-1);
    }
    loadAdminData();
    pageActice();
});

watch(() => search.value, () => {
    loadAdminData();
});

</script>

<template>
    <main>
        <NavBarView />

        <div style="padding: 3rex;">
            <div class="card text-center">
                <div class="card-header">
                    <ul class="nav nav-tabs card-header-tabs">
                        <li class="nav-item">
                            <a :class="active.all" href="/admin/manage">All</a>
                        </li>
                        <li class="nav-item">
                            <a :class="active.active" href="/admin/manage/active">Active</a>
                        </li>
                        <li class="nav-item">
                            <a :class="active.disactive" href="/admin/manage/disavitve">Disactive</a>
                        </li>
                    </ul>
                </div>

                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-12">
                            <div class="row g-3">

                                <div class="col-12 col-md-3">
                                    <form class="d-flex" role="search">
                                        <div class="input-group">
                                            <span class="input-group-text" id="basic-addon1"><i
                                                    class="bi bi-search"></i></span>
                                            <input class="form-control" type="search" placeholder="Email Address"
                                                aria-label="Search" aria-describedby="basic-addon1" v-model="search">
                                        </div>
                                    </form>
                                </div>

                                <div class="d-none d-md-block col-md-6"></div>

                                <div class="col-12 col-md-2">
                                    <div class="d-grid">
                                        <div class="input-group">
                                            <span class="input-group-text" id="inputGroup-sizing-default">Total :</span>
                                            <input class="form-control" type="text" value="Disabled readonly input"
                                                aria-label="Disabled input example" v-model="total" disabled readonly>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-12 col-md-1">
                                    <div class="d-grid">
                                        <button class="btn btn-primary d-block" type="button"
                                            @click="router.push('/admin/new')">New</button>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div class="col-12">
                            <section>
                                <o-table :data="data" :loading="loading" paginated backend-pagination :total="total"
                                    :per-page="perPage" backend-sorting :default-sort-direction="defaultSortOrder"
                                    :current-page="page" :default-sort="[sortField, sortOrder]"
                                    aria-next-label="Next page" aria-previous-label="Previous page"
                                    aria-page-label="Page" aria-current-label="Current page" @sort="onSort"
                                    @update:currentPage="onPageChange">

                                    <o-table-column v-slot="props" field="ssoid" label="Name" sortable>
                                        {{ props.row.name }}
                                    </o-table-column>

                                    <o-table-column v-slot="props" field="ssoid" label="Email" sortable>
                                        {{ props.row.email }}
                                    </o-table-column>

                                    <o-table-column v-slot="props" field="verify" label="Status" sortable>
                                        {{ props.row.status }}
                                    </o-table-column>

                                    <o-table-column v-slot="props" label="Action" width="100px">
                                        <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                                            <button v-if="props.row.status == false" class="btn btn-primary"
                                                type="button"
                                                @click="verifyStauts(props.row.email, false)">Active</button>
                                            <button v-else class="btn btn-danger" type="button"
                                                @click="verifyStauts(props.row.email, true)">Disactive</button>
                                        </div>
                                    </o-table-column>

                                    <o-table-column v-slot="props" label="Modify" width="200px">
                                        <RouterLink :to="`/admin/edit/${props.row._id}`">
                                            <button class="btn btn-info me-md-2">Edit</button>
                                        </RouterLink>
                                    </o-table-column>

                                </o-table>
                            </section>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </main>
</template>