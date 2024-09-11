<script setup>
import AlertView from "@/components/AlertView.vue";
import '/src/assets/signpad.css'

import { ref } from 'vue';
import { useRouter } from "vue-router";
import { jwtDecode } from "jwt-decode";
import { onMounted } from 'vue'

onMounted(() => {
    let writingMode = false
    let isCursorInsideCanvas = false
    const canvas = document.querySelector('.signature-pad')
    const clearButton = document.getElementById('clear')
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 3
    ctx.lineJoin = ctx.lineCap = 'round'

    const handlePointerUp = () => {
        writingMode = false
    }

    const handlePointerDown = (event) => {
        writingMode = true
        ctx.beginPath()
        const [positionX, positionY] = getCursorPosition(event)
        ctx.moveTo(positionX, positionY)
    }

    const getCursorPosition = (event) => {
        const rect = canvas.getBoundingClientRect()
        const positionX = event.clientX - rect.left
        const positionY = event.clientY - rect.top
        return [positionX, positionY]
    }

    const handlePointerMove = (event) => {
        if (!writingMode) return
        if (!isCursorInsideCanvas) {
            writingMode = false
        }
        const [positionX, positionY] = getCursorPosition(event)
        ctx.lineTo(positionX, positionY)
        ctx.stroke()
    }

    const clearPad = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    const handleMouseEnter = () => {
        isCursorInsideCanvas = true
    }

    const handleMouseLeave = () => {
        isCursorInsideCanvas = false
    }

    clearButton.addEventListener('click', (event) => {
        event.preventDefault()
        clearPad()
    })


    canvas.addEventListener('pointerdown', handlePointerDown, { passive: true })
    canvas.addEventListener('pointerup', handlePointerUp, { passive: true })
    canvas.addEventListener('pointermove', handlePointerMove, { passive: true })
    canvas.addEventListener('mouseenter', handleMouseEnter)
    canvas.addEventListener('mouseleave', handleMouseLeave)
})
const router = useRouter();

const token = localStorage.getItem('token');

const userInfo = ref({
    email: '',
    position: '',
    signature: '',
});

const decodeInfo = function () {
    if (token) {
        const decoded = jwtDecode(token);
        userInfo.value.email = `${decoded.sso_email}`;
    }
}

const submit = async function () {
    try {

        const canvas = document.querySelector('.signature-pad')

        userInfo.value.signature = canvas.toDataURL('image/png')
        if (userInfo.value.signature === 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAAXNSR0IArs4c6QAABGJJREFUeF7t1AEJAAAMAsHZv/RyPNwSyDncOQIECEQEFskpJgECBM5geQICBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAgQdWMQCX4yW9owAAAABJRU5ErkJggg==') {
            throw new Error('Please sign your signature');
        }
        decodeInfo();

        // Send a request to the endpoint with the token in the Authorization header
        var response = await fetch('/api/users/create', {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userInfo.value),
        });

        console.log(userInfo.value);
        if (!response.ok) {
            throw new Error(response.statusText);
        }

        // convert the response to json
        const json = await response.json();
        // log the json
        console.log(json);
        router.push('/main');
    } catch (error) {
        console.log(error);
    }
}

</script>

<template>
    <div style="padding-top: 20rex;"></div>
    <div class="container">

        <h1>Welcome to BuzzLeave Applicaton System</h1>
        <h3>Please Select Your Position and Departmen below</h3>

        <div style="padding-top: 5rex; padding-bottom: 5rex;"></div>

        <form class="row g-3" @submit.prevent="submit">
            <div class="col-12">
                <label for="position" class="form-label">Please Select Your Position Title</label>
                <select id="position" class="form-select" aria-label="Default select example"
                    v-model="userInfo.position">
                    <option selected>Please select you position</option>
                    <option value="Provost">Provost</option>
                    <option value="head">Head of Department</option>
                    <option value="Dean">Dean Office</option>
                    <option value="Professor">Professor</option>
                    <option value="Instructor">Instructor</option>
                    <option value="Teaching Assist">Teaching Assist</option>
                    <option value="Academic Staff">Academic staff</option>
                    <option value="Teaching Staff">Teaching Staff</option>
                    <option value="Staff">Staff</option>
                </select>
            </div>

            <div class="col-12">
                <div class="row g-3">

                    <div class="col-12 col-md-2">
                        <div class="d-grid">
                            <label for="sign-pad" class="form-label">Please sign Your Signature</label>
                        </div>
                    </div>

                    <div class="col-12 col-md-1">
                        <div class="d-grid">
                            <button class="btn btn-secondary" id="clear">Clear</button>
                        </div>
                    </div>

                    <div class="d-none d-md-block col-md-8"></div>

                </div>
            </div>

            <div class="col-md-6">
                <canvas class="signature-pad"></canvas>
            </div>

            <div class="col-12">
                <div class="row g-3">

                    <div class="col-12 col-md-2">
                        <div class="d-grid">
                            <button type="submit" class="btn btn-lg btn-primary">Submit</button>
                        </div>
                    </div>

                    <div class="d-none d-md-block col-md-8"></div>

                    <div class="col-12 col-md-2">
                        <div class="d-grid">
                            <AlertView :title="`Information Suport`" :buttonClass="`btn btn-lg btn-warning`">
                                <template v-slot:button>
                                    Help (?)
                                </template>
                                <template v-slot:body>
                                    <p>
                                        If you have any question or need help, please contact our support team.
                                    </p>
                                </template>
                            </AlertView>
                        </div>
                    </div>

                </div>
            </div>

            <!-- <div class="mb-3">
                <label for="department" class="form-label">Your Under Departmen</label>
                <select id="department" class="form-select" aria-label="Default select example">
                    <option selected>Select your Department</option>
                    <option value="1">Biology Department (BOIL)</option>
                    <option value="2">Chemistry Departmen (CHEM)</option>
                    <option value="3">Computer Science Departmen (COMP)</option>
                    <option value="4">Mathematics Departmen (MATH)</option>
                    <option value="4">Physics Departmen (PHYS)</option>
                </select>
            </div> -->
        </form>
    </div>
    <div style="padding-bottom: 5rex;"></div>
</template>