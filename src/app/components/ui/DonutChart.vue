<template>
  <div class="doughnut_chart" style="position: relative">
    <svg :width="size" :height="size" viewBox="0 0 200 200" style="stroke-linecap: round">
      <!-- Background circle -->
      <path :d="dBg" fill="transparent" :stroke="backgroundStroke" :stroke-width="strokeWidth" />
      <!-- Move to start position, start drawing arc -->
      <path :d="d" fill="transparent" :stroke="foregroundStroke" :stroke-width="strokeWidth" />
    </svg>
    <div v-if="visibleValue" class="value-container">
      <template v-if="passTextAsHtml">
        <div v-if="customText.length" :style="customTextStyle" v-html="customText" />
      </template>
      <template v-else>
        <h1 v-if="percent" :class="classValue" :style="valueStyle">
          {{ valueCountUp ? countingUpValue + "%" : percent + "%" }}
        </h1>
        <div
          v-if="customText.length"
          v-html="customText"
          :class="classValue"
          :style="customTextStyle"
        />
      </template>
    </div>
    <div v-else-if="customText.length" class="value-container">
      <div
        v-if="customText.length"
        v-html="customText"
        :class="classValue"
        :style="customTextStyle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import type { CSSProperties } from "vue";

interface Props {
  percent?: number;
  foregroundColor?: string;
  backgroundColor?: string;
  strokeWidth?: number;
  radius?: number;
  size?: number;
  classValue?: string;
  visibleValue?: boolean;
  valueCountUp?: boolean;
  valueCountUpDuration?: number;
  valueCountUpDelay?: number;
  customPercentSize?: number;
  passTextAsHtml?: boolean;
  customText?: string;
  customTextColor?: string;
  customTextSize?: number;
}

const {
  percent = 0,
  foregroundColor = "#1993ff",
  backgroundColor = "#ecf6ff",
  strokeWidth = 10,
  radius = 85,
  size = 100,
  classValue = "",
  visibleValue = false,
  valueCountUp = false,
  valueCountUpDuration = 2000,
  valueCountUpDelay = 500,
  customPercentSize = 40,
  passTextAsHtml = false,
  customText = "",
  customTextColor = "",
  customTextSize = 25
} = defineProps<Props>();

const countingUpValue = ref(0);
let delayTimer: NodeJS.Timeout | undefined = undefined;

const largeArc = computed(() => ((valueCountUp ? countingUpValue.value : percent) < 50 ? 0 : 1));
const radians = computed(() => {
  const number = valueCountUp ? countingUpValue.value : percent;
  const degrees = (number / 100) * 360 - 180;
  return (degrees * Math.PI) / 180;
});
const endX = computed(() => -Math.sin(radians.value) * radius + 100 - 0.0001);
const endY = computed(() => Math.cos(radians.value) * radius + 100);
const z = computed(() => ((valueCountUp ? countingUpValue.value : percent) === 100 ? "z" : ""));
const dBg = computed(
  () => `M 100 ${100 - radius} A ${radius} ${radius} 0 1 1 99.9999 ${100 - radius} z`
);
const d = computed(
  () =>
    `M 100 ${100 - radius} A ${radius} ${radius} 0 ${largeArc.value} 1 ${endX.value} ${endY.value} ${z.value}`
);

const valueStyle = computed(() => ({
  color: validateColor(foregroundColor) ? foregroundColor : "#1993ff",
  fontSize: customPercentSize && customPercentSize < 60 ? `${customPercentSize}px` : "inherit",
  margin: "0 auto"
}));

const customTextStyle = computed<CSSProperties>(() => ({
  color: validateColor(customTextColor) ? customTextColor : foregroundColor,
  width: `calc(100% - ${strokeWidth * 2}px)`,
  padding: `0 ${strokeWidth}px`,
  margin: `${strokeWidth}px auto 0`,
  textAlign: "center",
  fontSize: `${customTextSize}px`,
  wordBreak: "break-word"
}));

const validateColor = (string: string) => {
  const s = new Option().style;
  s.color = string;
  return s.color !== "" || /^#([0-9A-F]{3}){1,2}$/i.test(s.color);
};

const countUpPercent = () => {
  if (percent === countingUpValue.value) return;
  const frameDuration = 1000 / 60;
  const totalFrames = Math.round(valueCountUpDuration / frameDuration);
  const easeOutQuad = (t: number) => t * (2 - t);
  let frame = 0;
  const counter = setInterval(() => {
    frame++;
    const progress = easeOutQuad(frame / totalFrames);
    countingUpValue.value = Math.round(percent * progress);
    if (frame === totalFrames) clearInterval(counter);
  }, frameDuration);
};

onMounted(() => {
  if (valueCountUp && percent) countUpPercent();
});

watch(
  () => percent,
  () => {
    clearTimeout(delayTimer);
    delayTimer = setTimeout(() => {
      countUpPercent();
    }, valueCountUpDelay);
  }
);

const backgroundStroke = computed(() =>
  validateColor(backgroundColor) ? backgroundColor : "#ecf6ff"
);
const foregroundStroke = computed(() =>
  validateColor(foregroundColor) ? foregroundColor : "#1993ff"
);
</script>

<style scoped>
h1 {
  margin: 0;
  padding: 0;
}

.value-container {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
