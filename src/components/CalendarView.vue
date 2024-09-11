<script setup>
import AlertView from "./AlertView.vue";

import { onMounted, ref } from 'vue'
import { jwtDecode } from "jwt-decode";
import { useRouter } from "vue-router";

const router = useRouter();

var position = ref();

// Set up the calendar the Date Title and the total days in the month
const date = ref('')
const daysArray = ref([])

// Set up the current date
let today = new Date();
let month = today.getMonth();
let year = today.getFullYear();

// Set up the total months name
const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "Devember"
];

// const week = ["Sun", "Mon", "Tue", "Wen", "Thu", "Fri", "Sat"];

// The function to initialize the calendar
function initCalendar() {

    // Set up the first day of the month in the year
    const firstDay = new Date(year, month, 1);

    // Set up the last day of the month in the year
    const lastDay = new Date(year, month + 1, 0);

    // Set up the last day of the previous month
    const pervLastDay = new Date(year, month, 0);

    // Set up the pervious days in the previous month
    const prevDay = pervLastDay.getDate();

    // Set up the last day in the month
    const lastDate = lastDay.getDate();

    // Set up the first day in the month
    const day = firstDay.getDay();

    // Set up the next days in the month
    const nextDays = 7 - lastDay.getDay() - 1;

    // Declare the days variable
    let days = "";

    // Prev month days
    for (let i = day; i > 0; i--) {
        // days += prevDay - i + 1 + ",";
        days += (prevDay - i + 1) - (prevDay - i + 1) + ","
    }

    // Current month day
    for (let i = 1; i <= lastDate; i++) {
        // If day is today add class today
        if (
            i === today.getDate() &&
            year === today.getFullYear() &&
            month === today.getMonth()
        ) {
            days += i + ",";
            // Add remaining days
        } else {
            days += i + ",";
        }
    }

    // Next month days
    for (let j = 1; j <= nextDays; j++) {
        // Remove the line that assigns a value to the 'days' variable
        // days += j + ",";
        days += j - j + ",";
    }

    date.value = months[month] + " " + year;
    daysArray.value = days.split(",").filter((item) => item !== "")
}

// The function to go to the previous month
function prevMonth() {
    month--;
    if (month < 0) {
        month = 11;
        year--;
    }
    initCalendar();
}

// The function to go to the next month
function nextMonth() {
    month++;
    if (month > 11) {
        month = 0;
        year++;
    }
    initCalendar();
}

// The function to go to the specific day
function goDay() {
    if (document.getElementById("userInputDate").value === '') {
        initCalendar()
    } else {
        today = new Date(document.getElementById("userInputDate").value)
        month = today.getMonth()
        year = today.getFullYear()
    }
    initCalendar()
}

// Call the function to initialize the calendar
initCalendar()

function selectDate(dateStr, type) {
    const selectDay = new String(dateStr).split(' ');
    console.log("Date" + ":" + selectDay[0] + " " + selectDay[1] + " " + selectDay[2], "Type" + ":" + type)

    if (type === "F1") {
        // router.push(`/form/f1/${new Date(selectDay[2] + "-" + selectDay[1] + "-" + selectDay[0])}`);
        router.push(`/form/f1/${new Date(selectDay[2] + "-" + selectDay[1] + "-" + selectDay[0])}`);
    } else if (type === "F4") {
        // router.push(`/form/f4/${new Date(selectDay[2] + "-" + selectDay[1] + "-" + selectDay[0])}`);
        router.push(`/form/f4/${new Date(selectDay[2] + "-" + selectDay[1] + "-" + selectDay[0])}`);
    }
    // const watch = document.querySelectorAll(".day");
    // watch.forEach((d) => {
    //     if (d.textContent != 0) {
    //         d.addEventListener("click", () => {
    //             const selectDay = year + "-" + months[month] + "-" + d.textContent
    //             console.log(selectDay)
    //             router.push(`/form/f4/${new Date(selectDay)}`);
    //         });
    //     }
    // });
}

onMounted(() => {
    const token = localStorage.getItem('token');
    if (token) {
        const decoded = jwtDecode(token);
        position.value = `${decoded.position}`;
    }
});

</script>

<template>
    <div class="container card">
        <div class="card-body">
            <div style="padding-top: 2rex;"></div>

            <div class="table-responsive">
                <h1 class="card-title text-center">{{ date }}</h1>
                <table class="table table-bordered align-middle" style="table-layout: fixed;">
                    <thead>
                        <tr class="col-md-3">
                            <th class="text-center">Sun</th>
                            <th class="text-center">Mon</th>
                            <th class="text-center">Tue</th>
                            <th class="text-center">Wed</th>
                            <th class="text-center">Thu</th>
                            <th class="text-center">Fri</th>
                            <th class="text-center">Sat</th>
                        </tr>
                    </thead>

                    <tbody class="table-group-divider" v-if="daysArray.length > 35">
                        <tr id="dayslist" v-for="col in 6" :key="col.index">
                            <td v-for="row in 7" :key="row.index" :class="`day text-center`">
                                <AlertView :title="`Select form`" :buttonClass="`btn-light border-0 bg-transparent`"
                                    v-if="daysArray[(col - 1) * 7 + row - 1] != 0">
                                    <template v-slot:button>
                                        <div v-if="daysArray[(col - 1) * 7 + row - 1] == today.getDate() && year === today.getFullYear() && month === today.getMonth()"
                                            class="today">
                                            {{ daysArray[(col - 1) * 7 + row - 1] }}
                                            <!-- <span
                                                class="position-absolute top-0 start-100 translate-left p-2 bg-danger border border-light rounded-circle"
                                                style="font-size: 50%; margin-top: -1em;">
                                            </span> -->
                                        </div>
                                        <div v-else-if="daysArray[(col - 1) * 7 + row - 1] != 0">
                                            {{ daysArray[(col - 1) * 7 + row - 1] }}
                                        </div>
                                    </template>
                                    <template v-slot:body>
                                        <p>
                                            Please select the form to apply
                                        </p>
                                        <button class="btn btn-primary" data-bs-dismiss="modal"
                                            @click="selectDate(`${daysArray[(col - 1) * 7 + row - 1]} ${date}`, 'F1')">Apply
                                            F1
                                        </button>
                                        <button v-if="position == 'Teaching Assist' || 'Teaching Staff' || 'Instructor' || 'Professor'" class="btn btn-primary" data-bs-dismiss="modal"
                                            @click="selectDate(`${daysArray[(col - 1) * 7 + row - 1]} ${date}`, 'F4')">Apply
                                            F4
                                        </button>
                                    </template>
                                </AlertView>

                            </td>
                        </tr>
                    </tbody>

                    <tbody class="table-group-divider" v-else>

                        <tr id="dayslist" v-for="col in 5" :key="col.index">
                            <td v-for="row in 7" :key="row.index" :class="`day btn-light text-center`">
                                <AlertView :title="`Select form`" :buttonClass="`btn-light border-0 bg-transparent`"
                                    v-if="daysArray[(col - 1) * 7 + row - 1] != 0">
                                    <template v-slot:button>
                                        <div v-if="daysArray[(col - 1) * 7 + row - 1] == today.getDate() && year === today.getFullYear() && month === today.getMonth()"
                                            class="today">
                                            {{ daysArray[(col - 1) * 7 + row - 1] }}
                                            <!-- <span
                                                class="position-absolute top-0 start-100 translate-left p-2 bg-danger border border-light rounded-circle"
                                                style="font-size: 50%; margin-top: -1.3em;">
                                            </span> -->
                                        </div>
                                        <div v-else-if="daysArray[(col - 1) * 7 + row - 1] != 0">
                                            {{ daysArray[(col - 1) * 7 + row - 1] }}
                                        </div>
                                    </template>
                                    <template v-slot:body>
                                        <p>
                                            Please select the form to apply
                                        </p>
                                        <button class="btn btn-primary" data-bs-dismiss="modal"
                                            @click="selectDate(`${daysArray[(col - 1) * 7 + row - 1]} ${date}`, 'F1')">Apply
                                            F1
                                        </button>
                                        <button v-if="position == 'Teaching Assist' || 'Teaching Staff' || 'Instructor' || 'Professor'" class="btn btn-primary" data-bs-dismiss="modal"
                                            @click="selectDate(`${daysArray[(col - 1) * 7 + row - 1]} ${date}`, 'F4')">Apply
                                            F4
                                        </button>
                                    </template>
                                </AlertView>
                            </td>
                        </tr>

                        <!-- <tr id="dayslist" v-for="col in 5" :key="col.index" @click="selectDate()">
                            <td v-for="row in 7" :key="row.index" class="day text-center"
                                @click="selectDate(`${daysArray[(col - 1) * 7 + row - 1]} ${date}`)">
                                <div v-if="daysArray[(col - 1) * 7 + row - 1] == today.getDate() && year === today.getFullYear() && month === today.getMonth()"
                                    class="today">
                                    {{ daysArray[(col - 1) * 7 + row - 1] }}
                                </div>
                                <div v-else-if="daysArray[(col - 1) * 7 + row - 1] != 0">
                                    {{ daysArray[(col - 1) * 7 + row - 1] }}
                                </div>
                            </td>
                        </tr> -->

                    </tbody>

                </table>

                <div class="row g-3">
                    <div class="col-sm-7">
                        <input id="userInputDate" type="date" placeholder="mm/yyyy" class="form-control" />
                    </div>
                    <div class="col-sm">
                        <button class="btn btn-outline-success" @click="goDay()">Go</button>
                    </div>
                    <div class="col-auto">
                        <button @click="prevMonth" class="btn btn-outline-primary">&lt;</button>
                    </div>
                    <div class="col-auto">
                        <button @click="nextMonth" class="btn btn-outline-primary">&gt;</button>
                    </div>
                </div>
                <div style="padding-top: 2rex;"></div>
            </div>
        </div>
        <div style="padding-top: 2rex;"></div>
    </div>
</template>

<style>
td.day:hover {
    /* color: aliceblue; */
    background-color: #50C4ED;
    cursor: pointer;
}

td .modal-body {
    text-align: left;
}

.today {
    position: relative;
    font-size: 1.2rem;
    color: #267ee8;
    font-weight: bold;
}

.noDayinMonth {
    font-size: 1.2rem;
    color: grey;
}

.Sun {
    color: red;
}
</style>