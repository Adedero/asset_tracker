<script setup lang="ts">
import risk from "@/app/assets/img/risk.png";
import faq from "@/app/assets/img/faq.png";
import contactUs from "@/app/assets/img/contact-us.png";
</script>

<template>
  <VueLayout name="user">
    <div>
      <VNavbar />

      <div
        class="mt-2 py-2 flex gap-2 *:flex-shrink-0 h-[calc(100dvh-8.5rem)] overflow-y-auto justify-center"
      >
        <div class="w-full h-fit max-w-[48rem] grid md:grid-cols-3 gap-4">
          <VCard header="FAQ">
            <div class="h-40 rounded-lg">
              <img :src="faq" class="w-full h-full object-cover" />
            </div>
            <p class="text-sm text-mute text-center">
              Get answers to your most pressing questions by taking a look at the frequently asked
              questions.
            </p>
            <div class="mt-3">
              <Button
                @click="$router.push({ name: 'user-faq' })"
                size="small"
                fluid
                label="View FAQs"
              />
            </div>
          </VCard>

          <VCard header="Risk Acknowledgement">
            <div class="h-40 rounded-lg">
              <img :src="risk" class="w-full h-full object-cover" />
            </div>
            <p class="text-sm text-mute text-center">
              We do our best to minimize all risks, but they cannot be avoided in any financial
              investment.
            </p>
            <div class="mt-3">
              <Button
                @click="$router.push({ name: 'user-risk-acknowledgment' })"
                size="small"
                fluid
                label="Read More"
              />
            </div>
          </VCard>

          <VCard header="Contact Us">
            <div class="h-40 rounded-lg">
              <img :src="contactUs" class="w-full h-full object-cover" />
            </div>
            <p class="text-sm text-mute text-center">
              Reach out to us if you have any issues or complaints. We typically respond within
              minutes.
            </p>
            <div class="mt-3">
              <Button
                @click="$router.push({ name: 'user-contact' })"
                size="small"
                fluid
                label="Contact Us"
              />
            </div>
          </VCard>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
