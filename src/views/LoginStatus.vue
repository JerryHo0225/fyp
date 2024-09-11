<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from 'vue-router'
import { jwtDecode } from "jwt-decode";

const router = useRouter();
const route = useRoute();

const userEmail = ref("");
const userPosition = ref("");

localStorage.setItem('token', route.params.token);

onMounted(async () => {
    if (localStorage.getItem('token') != null) {
        const decoded = jwtDecode(route.params.token);
        userEmail.value = `${decoded.sso_email}`
        userPosition.value = `${decoded.position}`
        if (userPosition.value == "none") {
            router.push({ name: 'newuser-page' });
        } else {
            router.push({ name: 'main-page' });
        }
    }
});

</script>

<template>
    <main>

        <div class="row d-flex justify-content-center">

            <div class="col-md-6">
                <div class="d-grid gap-2 col-6 mx-auto">
                    <button class="btn btn-lg btn-light" type="button" disabled>
                        <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                        Login...
                    </button>
                </div>
            </div>

        </div>

    </main>
</template>
