<template>
  <div class="w-full flex items-center justify-center">
    <Chart type="pie" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Transaction } from "@/prisma-gen";
import { ChartProps } from "primevue/chart";
import { ref, onMounted } from "vue";

onMounted(() => {
  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
});

interface Props {
  transactions: Transaction[];
}

const { transactions } = defineProps<Props>();

const chartData = ref();
const chartOptions = ref();

const setChartData = () => {
  const documentStyle = getComputedStyle(document.documentElement);

  // Separate transactions into deposits and withdrawals
  const deposits = transactions.filter((t) => t.transactionType === "DEPOSIT");
  const withdrawals = transactions.filter((t) => t.transactionType === "WITHDRAWAL");
  const investments = transactions.filter((t) => t.transactionType === "INVESTMENT");
  const profits = transactions.filter((t) => t.transactionType === "PROFIT");

  const labels = ["Deposits", "Withdrawals", "Investments", "Profits"];

  return {
    labels,
    datasets: [
      {
        data: [deposits.length, withdrawals.length, investments.length, profits.length],
        backgroundColor: [
          documentStyle.getPropertyValue("--p-emerald-500"),
          documentStyle.getPropertyValue("--p-red-500"),
          documentStyle.getPropertyValue("--p-amber-500"),
          documentStyle.getPropertyValue("--p-blue-500")
        ],
        hoverBackgroundColor: [
          documentStyle.getPropertyValue("--p-emerald-400"),
          documentStyle.getPropertyValue("--p-red-400"),
          documentStyle.getPropertyValue("--p-amber-500"),
          documentStyle.getPropertyValue("--p-blue-500")
        ]
      }
    ]
  };
};

const setChartOptions = (): ChartProps["options"] => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue("--p-text-color");

  return {
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          color: textColor
        }
      }
    }
  };
};
</script>
