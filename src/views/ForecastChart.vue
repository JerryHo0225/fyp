<template>
  <NavBarView></NavBarView>
  <div id="app">
    <div>
      <apexchart
        v-if="!isLoading && !error"
        :options="chartOptions"
        :series="series"
        height="350"
      ></apexchart>
      <div v-else-if="isLoading">Loading data...</div>
      <div v-else-if="error">{{ error }}</div>
    </div>
  </div>
  <Footer></Footer>
</template>

<script>
import { ref, onMounted } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import {NavBarView} from '@/components/NavBarView.vue';


export default {
  name: 'ForecastChart',
  components: {
    apexchart: VueApexCharts,
    NavBarView,
  },
  setup() {
    const isLoading = ref(true);
    const error = ref(null);

    const series = ref([
      {
        name: 'Close Price',
        data: [],
      },
    ]);

    const chartOptions = ref({
      chart: {
        height: 350,
        type: 'line',
      },
      forecastDataPoints: {
        count: 700,
      },
      // stroke: {
      //   width: 5,
      //   curve: 'smooth',
      // },
      xaxis: {
        type: 'datetime',
        categories: [],
        tickAmount: 10,
        labels: {
          formatter(value, timestamp, opts) {
            return opts.dateFormatter(new Date(timestamp), 'dd MMM');
          },
        },
      },
      title: {
        text: 'Forecast',
        align: 'left',
        style: {
          fontSize: '16px',
          color: '#666',
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          gradientToColors: ['#FDD835'],
          shadeIntensity: 1,
          type: 'horizontal',
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100, 100, 100],
        },
      },
    });

    const fetchData = async () => {
      isLoading.value = true;
      error.value = null;

      try {
        // Replace '/api/forecast' with your actual API endpoint
        const response = await fetch('/api/stocks/MMM');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Validate the data
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Invalid data format received from API');
        }

        // Extract dates and Close prices (rounded to 2 decimal places)
        const dates = data.map((item) => item.date);
        const closePrices = data.map((item) => {
          const closeValue = parseFloat(item.Close);
          return parseFloat(closeValue.toFixed(2));
        });

        // Update the series data
        series.value[0].data = closePrices;

        // Update the categories for x-axis
        chartOptions.value.xaxis.categories = dates;
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'An error occurred';
        console.error('Error fetching data:', err);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      fetchData();
    });

    return {
      series,
      chartOptions,
      isLoading,
      error,
    };
  },
};
</script>

<script setup>
import Footer from '@/components/Footer.vue'
</script>

<style scoped>
#app {
  max-width: 800px;
  margin: auto;
}
</style>