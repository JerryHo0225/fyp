<script setup>
import { ref } from 'vue';
import { useRouter } from "vue-router";

const router = useRouter();

// credentials
const credentials = ref({
    email: '',
    password: ''
});

const login = async () => {
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials.value)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        // save token to local storage
        localStorage.setItem('token', data.token);
        alert("Welcome");
        router.push('/dashboard');
    } catch (error) {
        alert(error);
    }
}

</script>
<template>
    <div style="padding-top: 20rex;"></div>

    <form class="container" @submit.prevent="login">
        <h1>Welcome to BuzzLeave Applicaton System</h1>
        <h3>Please login below</h3>

        <div style="padding-top: 5rex; padding-bottom: 5rex;"></div>

        <div class="form-floating mb-3">
            <input type="email" class="form-control" id="floatingInput" placeholder="name@example.com"
                v-model="credentials.email" required>
            <label for="floatingInput">Email address</label>
            <div class="invalid-feedback">
                Please provide a valid email.
            </div>
        </div>

        <div class="form-floating mb-3">
            <input type="password" class="form-control" id="floatingPassword" placeholder="Password"
                v-model="credentials.password" required>
            <label for="floatingPassword">Password</label>
        </div>

        <div class="col-12">
            <div class="row g-3">

                <div class="col-12 col-md-2">
                    <div class="d-grid">
                        <button type="submit" class="btn btn-lg btn-primary">Login</button>
                    </div>
                </div>

                <div class="d-none d-md-block col-md-8"></div>

                <div class="col-12 col-md-2">
                    <div class="d-grid">
                        <button class="btn btn-lg btn-danger d-block" type="button"
                            @click="$router.go(-1)">Cancel</button>
                    </div>
                </div>

            </div>
        </div>
    </form>
</template>