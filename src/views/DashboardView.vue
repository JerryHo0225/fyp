<script setup>
import NavBarView from '../components/NavBarView.vue';
// import VueApexCharts from "vue3-apexcharts";

import { onMounted, ref } from 'vue'
import { jwtDecode } from "jwt-decode";
import { useRouter } from "vue-router";
// import { useRouter, useRoute } from "vue-router";
// import { jwtDecode } from "jwt-decode";

const router = useRouter();



// import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const options = ref({});
const series = ref([]);
const data = ref([]);
const selected_class = ref('')
const role = ref('');
// const convertedData = ref([]);



async function getDataDonut() {
  var response = await fetch(`/api/department?select_element=${selected_class.value}`);
  var json = await response.json();
  options.value = {
    colors: ['#F10080', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'],
    labels: json.map((item) => item._id),

    chart: {
      type: 'donut',
      dropShadow: {
        enabled: true,
        color: '#111',
        top: -1,
        left: 3,
        blur: 3,
        opacity: 0.2
      }
    },
    stroke: {
      width: 0,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              showAlways: true,
              show: true,
              fontSize: '50px',
              fontFamily: 'Helvetica, Arial, sans-serif',
            },
          },
        }
      }
    },
    states: {
      hover: {
        filter: 'none'
      }
    },
    responsive: [{
      breakpoint: 300,
      options: {
        chart: {
          width: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }]

  };

  //  series_line.value = convertedData.value.sort((a, b) => a.name.localeCompare(b.name));
  series.value = json.map((item) => item.total);

}

async function getDataLine() {
  var response_department_trend = await fetch(`/api/department_trend?select_element=${selected_class.value}`);

  var json = await response_department_trend.json();

  data.value = json.data.sort((a, b) => new Date(a.date) - new Date(b.date));

  console.log(data.value)
  // Convert the data to the desired format

  const groupedData = {};
  const convertedData = ref([]);
  data.value.forEach(item => {
    const { date, department, total } = item;
    const timestamp = new Date(date).getTime();

    if (!groupedData[department]) {
      groupedData[department] = [];
    }

    groupedData[department].push([timestamp, total]);
  });

  for (const department in groupedData) {
    convertedData.value.push({
      name: department,
      data: groupedData[department]
    });
  }

  series_line.value = convertedData.value.sort((a, b) => a.name.localeCompare(b.name));
  console.log(series_line.value)

}
onMounted(async () => {

  const token = localStorage.getItem('token');

  if (!token ){
  alert("Unauthorized user access");
  router.push('/admin/login');
}

if (token) {
    const decoded = jwtDecode(token);
    role.value = `${decoded.role}`;
    if (  role.value !="admin"){
      alert("Unauthorized user access");
      router.push('/admin/login');
    }

    getDataLine();
    getDataDonut();
}






});

// function clickFunction(event, chartContext, config) {
//    console.log('click', event, chartContext, config)
// }

// chartContext, config
var title = ref("for All Department")
function click(event) {
  // data = ref([])
  const clickedElement = event.target;
  const attribselected_classuteValue = clickedElement.getAttribute('j');
  selected_class.value = options.value.labels[attribselected_classuteValue]
  title.value =  selected_class.value
  if(title.value=='ADOHKF1'||title.value=='LVEF4'){
    title.value =  "for All Department"
  }

  console.log(selected_class.value)
  if (attribselected_classuteValue != null) {
    getDataLine();
    getDataDonut();
  }
  console.log(series_line.value)
}

const chartOptions = ref({
  chart: {
    id: 'area-chart',
    responsive: [{
      breakpoint: 300,
      options: {
        chart: {
          width: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  },
  colors: ['#F10080', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'],
  xaxis: {
    type: 'datetime',
    tooltip: {
      enabled: false
    }
  },
  yaxis: {
    title: {
      text: 'Number of Application'
    },
  },
  dataLabels: {
    enabled: true
  },
  stroke: {
    curve: 'smooth'
  },

  // markers: {
  //   size: 6,
  //   strokeColors: '#ffffff',
  //   strokeWidth: 2,
  //   hover: {
  //     size: 12
  //   }
  // }
})

var series_line = ref([])

async function downloadExcel() {
  // Fetch the data from the Bingo database
  var data = await fetch(`/api/download`);
  data = await data.json()

  console.log(data.f1)

  // Convert the data to the Excel format using XLSX
  const worksheet = XLSX.utils.json_to_sheet(data.f4);
  var workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  const worksheet_2 = XLSX.utils.json_to_sheet(data.f1);
  //  workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet_2, 'Sheet2');

  // Generate a unique filename for the Excel file
  const filename = 'application_raw' + new Date().getTime() + '.xlsx';

  // Save the file using FileSaver.js
  XLSX.writeFile(workbook, filename);
}

</script>

<template>
  <main>
    <NavBarView></NavBarView>

    <div style="padding: 3rex;">

      <div class="row">
        <div class="col">
          <div class="card">
            <h2 class="card-header">Record Download</h2>
            <div class="card-body">
              <button @click="downloadExcel" type="button" class="btn btn-success fw-bold">Download Excel</button>
            </div>
          </div>
        </div>
      </div>

      <div style="padding-top: 3rex"></div>

      <div class="row row-cols-1 row-cols-md-2 g-4">

        <div class="col">
          <div class="card">
            <h2 class="card-header">Total Applications Record {{ title }}</h2>
            <div class="card-body">
              <apexchart type="donut" :options="options" :series="series" @click="click" height="507px"/>
            </div>
          </div>
        </div>

        <div class="col">
          <div class="card">
            <h2 class="card-header">Trends of Applications Record {{ title }}</h2>
            <div class="card-body">
              <apexchart type="line" :options="chartOptions" :series="series_line" height="500px"/>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- <div class="container" style="padding-top: 3rex">
      <div class="row g-4">

        <div class="col-6 ">
          <apexchart type="donut" :options="options" :series="series" @click="click" />
          <button @click="downloadExcel" type="button" class="btn btn-success">Download Excel</button>
        </div>

        <div class="col-6 card " style="background-color:azure;">
          <apexchart type="line" :options="chartOptions" :series="series_line"></apexchart>
        </div>

      </div>

    </div> -->

  </main>
</template>