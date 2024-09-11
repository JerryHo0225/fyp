src/components/AlertView.vue<script setup>
import { onMounted, ref } from 'vue'
import { Modal } from 'bootstrap';

const modal = ref(null)
const myModal = ref(null)

const props = defineProps({
    title: {
        type: String,
        default: 'Modal title'
    },
    buttonClass: {
        type: String,
        default: 'btn btn-primary'
    },
    buttonType: {
        type: String,
         default: 'button'
    }
})

const openModal = () => {
    // const myModal = new Modal(modal.value)
    myModal.value.toggle()
}

onMounted(() => {
    myModal.value = Modal.getOrCreateInstance(modal.value, { backdrop: 'static' })
    // myModal.value = new Modal(modal.value, {backdrop:'static'})
})
</script>

<template>
    <!-- data-bs-toggle="modal" -->
    <!-- data-bs-config='{"backdrop":"static"}' -->

    <!-- Button -->
    
    <button :type="props.buttonType" :class="props.buttonClass" @click="openModal">
        <slot name="button"></slot>
    </button>

    <!-- Modal -->
    <div class="modal fade" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" ref="modal"
        style="position: absolute; display: none;">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">{{ props.title }}</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <slot name="body"></slot>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <!-- <button type="button" class="btn btn-primary">Save changes</button> -->
                </div>
            </div>
        </div>
    </div>

</template>