<script setup>
import NavBarView from '../components/NavBarView.vue';

import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { jwtDecode } from "jwt-decode";

const token = localStorage.getItem('token');
const userRole = ref("");

const route = useRoute()
const router = useRouter()

const sortVerify = ref();

const search = ref("");
const stauts = ref({
    verify: false,
})

const data = ref([]);
const total = ref(0);
const loading = ref(false);
const sortField = ref("ssoid");
const sortOrder = ref("desc");
const defaultSortOrder = ref("desc");
const page = ref(1);
const perPage = ref(10);

const active = ref({
    total: "nav-link",
    unverified: "nav-link",
    approval: "nav-link",
    reject: "nav-link",
})

// The card nav-link active status handling function
const pageActice = function () {
    if (route.name == 'admin-portal-total' || route.name == 'admin-portal') {
        active.value.total = "nav-link active";
    } else if (route.name == 'admin-portal-unverified') {
        active.value.unverified = "nav-link active";
    } else if (route.name == 'admin-portal-reject') {
        active.value.reject = "nav-link active";
    }
}

// Load all users data from the backend
const loadUserData = () => {
    if (route.name == 'admin-portal-unverified') {
        sortVerify.value = false;
    } else if (route.name == 'admin-portal-reject') {
        sortVerify.value = true;
    } else {
        sortVerify.value = '';
    }
    const params = [
        `userEmail=${search.value}`,
        `sort_by=${sortField.value}.${sortOrder.value}`,
        `page=${page.value}`,
        `verify=${sortVerify.value}`,
    ].join("&");
    loading.value = true;
    var url = `/api/users/alluser?${params}`;
    fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then((response) => response.json())
        .then((result) => {
            let currentTotal = result.total;
            total.value = currentTotal;
            data.value = result.users.map((item) => {
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

// The user account verification status handing function
const verifyStauts = async function (email, cur) {
    var url = `/api/users/verify/${email}`;
    var method = 'PATCH';

    if (cur == false) {
        stauts.value.verify = true;
        const response = await fetch(url, {
            method: method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(stauts.value)
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const json = await response.json();
        alert(JSON.stringify(json));
    } else if (cur == true) {
        const response = await fetch(url, {
            method: method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(stauts.value)
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const json = await response.json();
        alert(JSON.stringify(json));
    }
    loadUserData();
}

const onPageChange = (p) => {
    // console.log(p);
    page.value = p;
    loadUserData();
};

/*
 * Handle sort event
 */
const onSort = (field, order) => {
    sortField.value = field;
    sortOrder.value = order;
    loadUserData();
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
    loadUserData();
    pageActice();
});

watch(() => search.value, () => {
    loadUserData();
});

</script>

<template>
    <main>
        <NavBarView></NavBarView>

        <div style="padding: 3rex;">
            <div class="card text-center">
                <div class="card-header">
                    <ul class="nav nav-tabs card-header-tabs">
                        <li class="nav-item">
                            <a :class="active.total" href="/admin/portal/total">Total</a>
                        </li>
                        <li class="nav-item">
                            <a :class="active.unverified" href="/admin/portal/unverified">Unverified</a>
                        </li>
                        <li class="nav-item">
                            <a :class="active.reject" href="/admin/portal/reject">Reject</a>
                        </li>
                    </ul>
                </div>

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
                                                <input class="form-control" type="search" placeholder="Email"
                                                    aria-label="Search" aria-describedby="basic-addon1"
                                                    v-model="search" />
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
                            <section>
                                <o-table :data="data" :loading="loading" paginated backend-pagination :total="total"
                                    :per-page="perPage" backend-sorting :default-sort-direction="defaultSortOrder"
                                    :current-page="page" :default-sort="[sortField, sortOrder]"
                                    aria-next-label="Next page" aria-previous-label="Previous page"
                                    aria-page-label="Page" aria-current-label="Current page" @sort="onSort"
                                    @update:currentPage="onPageChange">

                                    <o-table-column v-slot="props" field="ssoid" label="Name" sortable>
                                        {{ props.row.ssoid }}
                                    </o-table-column>

                                    <o-table-column v-slot="props" field="sso_email" label="Email" sortable>
                                        {{ props.row.sso_email }}
                                    </o-table-column>

                                    <o-table-column v-slot="props" field="dept_unit_code" label="Department" sortable>
                                        {{ props.row.dept_unit_code }}
                                    </o-table-column>

                                    <o-table-column v-slot="props" field="position" label="Position" numeric sortable>
                                        {{ props.row.position }}
                                    </o-table-column>

                                    <o-table-column v-slot="props" field="verify" label="Verify" numeric sortable>
                                        {{ props.row.verify }}
                                    </o-table-column>

                                    <o-table-column v-slot="props" label="Action">
                                        <button v-if="props.row.verify == false" class="btn btn-primary" type="button"
                                            @click="verifyStauts(props.row.sso_email, false)">Approve</button>
                                        <button v-else class="btn btn-danger" type="button"
                                            @click="verifyStauts(props.row.sso_email, true)">Reject</button>
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

<style></style>
