<script setup>
import NavBarView from '../components/NavBarView.vue';

import { onMounted, ref } from 'vue'
// import { useRouter, useRoute } from "vue-router";
import { jwtDecode } from "jwt-decode";

// const router = useRouter();
// const route = useRoute();

var position = ref();
onMounted(() => {
    const token = localStorage.getItem('token');
    if (token) {
        const decoded = jwtDecode(token);
        position.value = `${decoded.position}`;
    }
});

</script>

<template>
    <main>
        <NavBarView></NavBarView>

        <div class="container text-center" style="padding-top: 3rex;">

            <div class="row row-cols-1 row-cols-md-2 g-4 justify-content-center">

                <div class="col">
                    <div class="card">
                        <div class="card-body">
                            <a href="/form/f1" style="text-decoration: none; color: black;">
                                <div class="card-body text-center"><button class="btn-primary border border-dark"
                                        type="button"
                                        style="font-size: 0px;background: url(src/assets/img/f1.jpg) top / contain no-repeat, var(--bs-body-bg);font-family: 'Noto Sans Inscriptional Pahlavi', sans-serif;font-weight: bold;width: 350px;border-width: 0px;height: 310px;position: relative;">Button</button>
                                    <h4 style="padding: 5px 0px 5px 0px;">HRO/ADOHK/F1</h4>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                <div class="col" v-if="position == 'Teaching Assist' || 'Teaching Staff' || 'Instructor' || 'Professor'">
                    <div class="card">
                        <div class="card-body">
                            <a href="/form/f4" style="text-decoration: none; color: black;">
                                <div class="card-body text-center">
                                    <button class="btn-primary border border-dark" type="button"
                                        style="font-size: 0px;background: url(src/assets/img/f4.jpg) top / contain no-repeat, var(--bs-body-bg);font-family: 'Noto Sans Inscriptional Pahlavi', sans-serif;font-weight: bold; width: 350px;border-width: 0px;height: 310px;position: relative;">Button</button>
                                    <h4 style="padding: 5px 0px 5px 0px;">HRO/LVE/F4</h4>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    </main>
</template>