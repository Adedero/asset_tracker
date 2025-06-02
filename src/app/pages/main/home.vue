<script setup lang="ts">
import { APP_NAME } from "@/app/data/constants";
import tradingDashboard from "@/app/assets/img/trading-dashboard.png";
import tradingCharts from "@/app/assets/img/trading-charts.png";
import stocks from "@/app/data/stocks";
import features from "@/app/data/features";
import metrics from "@/app/data/metrics";
import tradedAssets from "@/app/data/traded-assets";
import { Vue3Marquee as Marquee } from "vue3-marquee";
import CountUp from "vue-countup-v3";
import VueLayout from "@/app/layouts/vue-layout.vue";
import { useHead } from "@unhead/vue";
import { Icon } from "@iconify/vue";

useHead({
  title: `Welcome to ${APP_NAME}`
});
</script>

<template>
  <VueLayout name="main">
    <div>
      <!-- HERO SECTION -->
      <section id="hero" class="lg:h-[calc(100dvh-5rem)]">
        <div
          class="relative pt-16 pb-8 lg:px-12 xl:px-28 grid place-content-center gap-10 lg:gap-5 lg:grid-cols-5 lg:items-center"
        >
          <div class="lg:col-span-2">
            <header
              class="text-center text-balance lg:text-left text-3xl md:text-5xl font-semibold"
            >
              <p>Unique solutions to</p>
              <p><span class="text-gradient-x">Trading</span> &</p>
              <p><span class="text-gradient-x">Investments</span>.</p>
            </header>
            <p class="mt-3 text-slate-500 dark:text-slate-400 text-center lg:text-left">
              With our trusted regulations and experience, <br />
              you can easily & safely build your investment assets.
            </p>
            <div class="mt-6 flex items-center justify-center lg:justify-normal gap-2">
              <RouterLink :to="{ name: 'register' }">
                <Button class="bg-gradient-x">Get Started</Button>
              </RouterLink>

              <RouterLink :to="{ name: 'services' }">
                <Button outlined class="outlined">Our Services</Button>
              </RouterLink>
            </div>
          </div>

          <div class="flex-center relative lg:col-span-3">
            <div
              class="relative bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden h-72 lg:h-[25rem] w-[90dvw] max-w-[40rem] lg:w-full lg:max-w-full shadow-lg dark:shadow-primary"
            >
              <img
                :src="tradingDashboard"
                alt="image"
                class="w-full h-full object-cover object-left-top"
              />
            </div>
          </div>

          <div
            class="z-[-1] absolute blur-[60px] left-[10%] lg:left-20 top-10 lg:top-20 aspect-square w-32 bg-purple-500/50 rounded-full"
          />
          <div
            class="z-[-1] absolute blur-[60px] right-10 lg:right-0 lg:left-[40%] top-60 lg:top-20 aspect-square w-32 bg-emerald-500/50 rounded-full"
          />
          <div
            class="z-[-1] absolute blur-[60px] right-20 bottom-0 aspect-square w-32 bg-red-500/50 rounded-full"
          />

          <div class="mt-8 lg:mt-20 lg:col-span-5 w-full overflow-x-hidden">
            <Marquee pauseOnHover :duration="40" class="max-w-full">
              <div class="flex items-center gap-6 py-2">
                <div v-for="stock in stocks" :key="stock.name" class="flex items-center gap-6">
                  <div>
                    <div class="flex items-center justify-between gap-3">
                      <p class="text-[0.7rem] font-medium text-slate-600 dark:text-slate-400">
                        {{ stock.name }}
                      </p>

                      <div class="flex items-center gap-1">
                        <Icon
                          :icon="
                            stock.trending === 'up'
                              ? 'ic:baseline-trending-up'
                              : 'ic:baseline-trending-down'
                          "
                          :class="stock.trending === 'up' ? 'text-green-500' : 'text-rose-500'"
                        />
                        <span
                          :class="`text-[0.6rem] ${stock.trending === 'up' ? 'text-green-500' : 'text-rose-500'}`"
                        >
                          {{ stock.percent }}
                        </span>
                      </div>
                    </div>
                    <p class="text-[0.78rem] font-medium">${{ stock.price }}</p>
                  </div>

                  <Divider layout="vertical" class="h-5" />
                </div>
              </div>
            </Marquee>
          </div>
        </div>
      </section>

      <!-- FEATURES  -->
      <section id="features">
        <div class="py-16 px-4 lg:px-16 xl:px-28">
          <header class="text-center text-balance">
            <p class="text-2xl md:text-4xl font-semibold">
              Take
              <span class="text-gradient-y"> full control </span>
              of your investments.
            </p>
            <p class="mt-2 text-mute">
              Stay on top of the market with our innovation technology,
              <br />
              extensive product access, and awair-winning service
            </p>
          </header>

          <div class="mt-20 px-12">
            <div class="grid gap-x-4 gap-y-16 md:grid-cols-2 lg:grid-cols-4">
              <div
                v-for="feature in features"
                :key="feature.title"
                class="relative h-40 bg-slate-200 dark:bg-white/10 backdrop-blur-md rounded p-4 flex flex-col *:flex-shrink-0"
              >
                <div
                  :class="`hexagon absolute z-10 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2
                flex-center px-8 py-6 ${feature.gradient} text-white drop-shadow-md dark:drop-shadow-none`"
                >
                  <Icon :icon="`ic:baseline-${feature.icon}`" style="font-size: 2rem" />
                </div>

                <div
                  :class="`hidden dark:block absolute aspect-square w-16 bg-opacity-8 rounded-full
                top-0 left-1/2 -translate-x-1/2 -translate-y-[40%] ${feature.shadow}`"
                ></div>

                <div class="text-center grid gap-1 mt-auto">
                  <h2 class="font-semibold">{{ feature.title }}</h2>
                  <p class="text-mute text-[0.82rem]">{{ feature.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="made-for-everyone">
        <div class="flex-center px-4 md:px-12 lg:px-28 py-20">
          <div class="z-1 relative overflow-hidden rounded-md">
            <div
              class="bg-primary-100 dark:bg-white/5 backdrop-blur-lg w-full md:h-full p-5 grid md:grid-cols-3 md:items-center gap-5"
            >
              <div class="mt-5 text-center md:text-left">
                <p
                  class="text-2xl md:text-3xl font-semibold md:whitespace-nowrap lg:whitespace-wrap"
                >
                  Made for everyone
                </p>
                <p class="text-mute text-sm mt-5">
                  We are one of the most innovative copy trading platforms in the world, transparent
                  and offering a smooth and simplified trading experience. Our vision is to become
                  the world&apos;s largest social trading community on the globe, offering
                  customer-focused investment solutions and an open environment.
                </p>

                <div class="mt-10">
                  <RouterLink :to="{ name: 'register' }">
                    <Button class="bg-gradient-x">Join Us Now</Button>
                  </RouterLink>
                </div>
              </div>

              <div class="relative md:col-span-2 h-80">
                <img
                  :src="tradingCharts"
                  alt="Trading charts"
                  fill
                  sizes="100%"
                  class="object-contain"
                />
              </div>
            </div>

            <div
              class="z-[-1] absolute aspect-square w-60 rounded-full -top-20 -left-20 bg-fuchsia-500/30 blur-2xl"
            ></div>
            <div
              class="z-[-1] absolute aspect-square w-60 rounded-full -bottom-20 -right-20 bg-cyan-500/30 blur-2xl"
            ></div>
          </div>
        </div>
      </section>

      <section id="metrics">
        <div class="bg-slate-200 dark:bg-slate-800 min-h-60 py-12 px-4 md:px-12 lg:px-28">
          <header class="text-center text-balance">
            <p class="text-2xl md:text-3xl font-semibold text-primary-500 dark:text-white">
              We are committed to meeting <br />
              your CFD and FX trading needs
            </p>
            <p class="mt-2 text-mute">
              Benefit from round-the-clock trading hours (Monday to Friday), high liquidity, low
              barriers to entry, a wide range of offerings, and opportunities to trade on world
              events.
            </p>
          </header>

          <div class="flex-center mt-10">
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
              <div
                v-for="metric in metrics"
                :key="metric.label"
                :class="`text-center rounded px-4 py-8 ${metric.bg}`"
              >
                <div
                  class="text-4xl md:text-5xl font-semibold flex items-end justify-center flex-wrap"
                >
                  <CountUp
                    :end-val="metric.value"
                    :duration="2.75"
                    :options="{ scrollSpyOnce: true, enableScrollSpy: true }"
                  />
                  <span class="text-2xl">{{ metric.unit }}</span>
                </div>
                <p class="text-sm mt-2">{{ metric.label }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="traded-assets">
        <div class="py-12 px-4 md:px-12 lg:px-28">
          <header class="text-center text-balance">
            <p class="text-2xl md:text-3xl font-semibold">
              Different <span class="text-gradient-x">assets</span> to trade
            </p>
            <p class="mt-2 text-mute">
              Invest in cash products, trade with leveraged products, or let the experts manage your
              money.
            </p>
          </header>

          <div class="flex-center mt-10">
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
              <div
                v-for="product in tradedAssets"
                :key="product.code"
                class="flex items-center gap-2 rounded p-4 bg-slate-200 dark:bg-slate-800"
              >
                <div
                  :class="`hexagon flex-center min-w-12 px-5 py-3 text-white text-sm font-semibold ${product.bg}`"
                >
                  {{ product.code }}
                </div>
                <Icon
                  icon="ic:baseline-chevron-right"
                  style="font-size: 1rem"
                  class="text-primary-500 dark:text-primary-400"
                />
                <p class="font-semibold text-primary-500 dark:text-primary-100">
                  {{ product.name }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div class="flex-center px-4 md:px-12 lg:px-28 py-12">
          <MainCtaBanner />
        </div>
      </section>
    </div>
  </VueLayout>
</template>
