<template>
  <div>
    <!-- <input v-model="inputSymbol" @keyup.enter="fetchData" placeholder="Enter stock symbol">
    <button @click="fetchData">Fetch Data</button> -->
    <button @click="toggleChartType">
      Switch to {{ isBarChart ? 'Line' : 'Bar' }} Chart
    </button>
    <button @click="addDataSetsOne">Add High</button>
    <button @click="addDataSetsTwo">Add Low</button>
    <button @click="addDataSetsThree">Add Volume</button>
    <button @click="addDataSetsFour">Add Open</button>
    <button @click="removeDataSets">Remove High, Low, Open, and Volume</button>
    
    <component 
      :is="currentChartComponent" 
      v-if="chartData.labels.length > 0" 
      :data="chartData" 
      :options="options"
      :key="chartUpdateTrigger" 
    />
    <p v-else>Loading data or no data available...</p>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Bar, Line } from 'vue-chartjs';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend
);

interface StockData {
  _id: string;
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  'Adj Close': number;
  Volume: number;
  Symbol: string;
}

export default {
  name: 'MoreStockChart',
  components: {
    Bar,
    Line
  },
  props: {
    initialSymbol: {
      type: String,
      default: 'AAPL'
    }
  },
  setup(props) {
    const isBarChart = ref(true);
    const inputSymbol = ref(props.initialSymbol);    
    const chartData = reactive({
      labels: [],
      datasets: [
        {
          label: 'Close Price',
          data: [],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Open',
          data: [],
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }
      ]
    });
    const options = reactive({
      responsive: true,
      scales: {
        y: {
        
          position: 'left' as const,
          title: {
            display: true,
            text: 'Price'
          }
        },
        y1: {
          
          position: 'right' as const,
          title: {
            display: true,
            text: 'Volume'
          },
          
        }
      }
    });
    const stockData = ref<StockData[]>([]);
    const chartUpdateTrigger = ref(0);

    const currentChartComponent = computed(() => (isBarChart.value ? Bar : Line));

    const toggleChartType = () => {
      isBarChart.value = !isBarChart.value;
      chartUpdateTrigger.value++;
    };

    const addDataSetsOne = () => {
      addDataSet('High', stockData.value.map(item => item.High), 'rgba(255, 99, 132, 0.6)');
    };

    const addDataSetsTwo = () => {
      addDataSet('Low', stockData.value.map(item => item.Low), 'rgba(54, 162, 235, 0.6)');
    };

    const addDataSetsThree = () => {
      addDataSet('Volume', stockData.value.map(item => item.Volume), 'rgba(255, 206, 86, 0.6)', 'y1');
    };

    const addDataSetsFour = () => {
      addDataSet('Open', stockData.value.map(item => item.Open), 'rgba(153, 102, 255, 0.6)');
    };

    const addDataSet = (label: string, data: number[], backgroundColor: string, yAxisID?: string) => {
      const existingLabels = new Set(chartData.datasets.map(ds => ds.label));
      if (!existingLabels.has(label)) {
        chartData.datasets.push({
          label,
          data,
          backgroundColor,
          borderColor: backgroundColor.replace('0.6', '1'), // Adjust border color
          borderWidth: 1,
          ...(yAxisID ? { yAxisID } : {})
        });
        chartUpdateTrigger.value++;
      }
    };

    const removeDataSets = () => {
      chartData.datasets = chartData.datasets.filter(ds => 
        !['High', 'Low', 'Volume', 'Open'].includes(ds.label)
      );
      chartUpdateTrigger.value++;
    };

    const fetchData = async () => {
      try {
    
        
        console.log('Fetching data for:', inputSymbol.value);
        const response = await fetch(`/api/stocks/${inputSymbol.value}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newData = await response.json();
        stockData.value = Array.isArray(newData) ? newData : (newData.data && Array.isArray(newData.data) ? newData.data : []);
        
        if (stockData.value.length === 0) {
          console.error('Fetched data is not in expected format:', newData);
          return;
        }

        updateChartData();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const updateChartData = () => {
      if (stockData.value.length === 0) {
        console.warn('No stock data available to update chart');
        return;
      }

      const dateFormatter = new Intl.DateTimeFormat();
      chartData.labels = stockData.value.map(item => {
        const date = new Date(item.Date); // Use 'Date' instead of 'date'
        return isNaN(date.getTime()) ? 'Invalid Date' : dateFormatter.format(date);
      });
      chartData.datasets[0].data = stockData.value.map(item => item.Close);
      chartData.datasets[1].data = stockData.value.map(item => item.Open);

      chartUpdateTrigger.value++;
    };

    onMounted(fetchData);

    watch(inputSymbol, () => {
      fetchData();
    });

    return {
      chartData,
      options,
      isBarChart,
      currentChartComponent,
      toggleChartType,
      addDataSetsOne,
      addDataSetsTwo,
      addDataSetsThree,
      addDataSetsFour,
      removeDataSets,
      chartUpdateTrigger,
      inputSymbol,
      fetchData
    };
  }
};
</script>

<style scoped>
/* Add any necessary styles here */
</style>