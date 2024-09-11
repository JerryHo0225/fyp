<script setup>
import { onMounted, ref } from 'vue'

const convertedData = ref([]);

const props = defineProps({
  chartWeight: {
    type: String,
    default: 'auto'
  },
  chartHeight: {
    type: String,
    default: 'auto'
  }
})

var data = ref([]);

onMounted(async () => {

  var response_department_trend = await fetch("/api/department_trend");

  var json = await response_department_trend.json();
  data.value = json.data


  // Convert the data to the desired format

  const groupedData = {};

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
  data.value = convertedData.value
  console.log(convertedData);
});

const chartOptions = ref({
  chart: {
    id: 'area-chart'
  },
  xaxis: {
    type: 'datetime',
    tooltip: {
      enabled: false
    }
  },
  yaxis: {
    title: {
      text: 'Number of '
    },

    // labels: {
    //     style: {
    //         colors: '#8e8da4',
    //     },
    //     offsetX: 0,
    //     formatter: function(val) {
    //       // return `${new Date(val)}`
    //       // return (val / 1000000).toFixed(2);
    //     },
    // },
  },
  dataLabels: {
    enabled: true
  },
  stroke: {
    curve: 'smooth'
  },
  markers: {
    size: 6,
    strokeColors: '#ffffff',
    strokeWidth: 2,
    hover: {
      size: 12
    }
  }
})

const series = convertedData.value
</script>

<template>
  <div class="example">
    <apexchart type="line" :options="chartOptions" :series="series" :width="props.chartWeight" :height="props.chartHeight"></apexchart>
  </div>
</template>
