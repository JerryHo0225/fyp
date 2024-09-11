<script setup>
import { useRouter } from "vue-router";
const router = useRouter();

async function outh2Login() {
    location.assign('/api/auth')
}

async function adminLogin() {
    router.push('/admin/login');
}

</script>

<template>
    <main>
        <section class="vh-100 gradient-custom">
            <div class="container py-5 h-100">
                <div class="row d-flex justify-content-center align-items-center h-100">
                    <div class="col-12 col-md-8 col-lg-6 col-xl-5">
                        <div class="card bg-light text-white" style="border-radius: 1rem;">
                            <div class="card-body p-5 text-center">

                                <div class="mb-md-5 mt-md-1 pb-5">

                                    <h2 class="fw-bold mb-3 text-uppercase text-start text-dark">Login in to HKBU Leave
                                        Application</h2>

                                    <hr class="my-3 text-dark">

                                    <div class="mb-3">
                                        <div class="d-grid gap-2">
                                            <button class="btn btn-dark btn-lg px-5 text-uppercase" type="button"
                                                @click="outh2Login()">User Login</button>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <div class="d-grid gap-2">
                                            <button class="btn btn-dark btn-lg px-5 text-uppercase" type="button"
                                                @click="adminLogin()">Admin Login</button>
                                        </div>
                                    </div>

                                    <!-- This is for layout design only -->
                                    <div class="d-flex justify-content-center text-center mt-4 pt-1">
                                        <a href="#!" class="text-white"><i class="fab fa-facebook-f fa-lg"></i></a>
                                        <a href="#!" class="text-white"><i
                                                class="fab fa-twitter fa-lg mx-4 px-2"></i></a>
                                        <a href="#!" class="text-white"><i class="fab fa-google fa-lg"></i></a>
                                    </div>
                                    <div class="d-flex justify-content-center text-center mt-4 pt-1">
                                        <a href="#!" class="text-white"><i class="fab fa-facebook-f fa-lg"></i></a>
                                        <a href="#!" class="text-white"><i
                                                class="fab fa-twitter fa-lg mx-4 px-2"></i></a>
                                        <a href="#!" class="text-white"><i class="fab fa-google fa-lg"></i></a>
                                    </div>
                                    <div class="d-flex justify-content-center text-center mt-4 pt-1">
                                        <a href="#!" class="text-white"><i class="fab fa-facebook-f fa-lg"></i></a>
                                        <a href="#!" class="text-white"><i
                                                class="fab fa-twitter fa-lg mx-4 px-2"></i></a>
                                        <a href="#!" class="text-white"><i class="fab fa-google fa-lg"></i></a>
                                    </div>
                                    <div class="d-flex justify-content-center text-center mt-4 pt-1">
                                        <a href="#!" class="text-white"><i class="fab fa-facebook-f fa-lg"></i></a>
                                        <a href="#!" class="text-white"><i
                                                class="fab fa-twitter fa-lg mx-4 px-2"></i></a>
                                        <a href="#!" class="text-white"><i class="fab fa-google fa-lg"></i></a>
                                    </div>
                                    <!-- This is for layout design only -->

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>


    </main>
</template>