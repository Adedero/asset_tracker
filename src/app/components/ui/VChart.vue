<template>
  <div ref="el" class="tradingview-widget-container" style="height: 100%; width: 100%">
    <div
      class="tradingview-widget-container__widget"
      style="height: calc(100% - 32px); width: 100%"
    ></div>
    <div class="tradingview-widget-copyright">
      <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
        <span class="blue-text">Track all markets on TradingView</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useDark } from "@vueuse/core";

const isDark = useDark();

interface Props {
  symbol?: string;
  interval?: string;
  autosize?: boolean;
}

const { symbol = "BTCUSD", interval = "D", autosize = true } = defineProps<Props>();

const el = ref<HTMLDivElement>();

const theme = computed(() => {
  return isDark.value ? "dark" : "light";
});

// Watch for theme changes and reload the widget
watch(theme, () => {
  loadWidget();
});

function loadWidget() {
  if (!el.value) {
    console.warn("TradingView widget container not found.");
    return;
  }

  // Clear the previous widget content
  const widgetContainer = el.value.querySelector(".tradingview-widget-container__widget");
  if (widgetContainer) {
    widgetContainer.innerHTML = ""; // Clear any existing content
  }

  // Create and append the new widget script
  const script = document.createElement("script");
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
  script.async = true;
  script.innerHTML = JSON.stringify({
    autosize: autosize,
    symbol: symbol,
    interval: interval,
    timezone: "Etc/UTC",
    theme: theme.value,
    style: "1",
    locale: "en",
    allow_symbol_change: true,
    calendar: false,
    support_host: "https://www.tradingview.com"
  });
  widgetContainer?.appendChild(script);
}

onMounted(() => {
  loadWidget();
});
</script>

<style scoped>
.blue-text {
  color: #1e90ff;
  text-decoration: underline;
}
</style>
