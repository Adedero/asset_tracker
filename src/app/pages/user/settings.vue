<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core";

const isDark = useDark();
const toggleDark = useToggle(isDark);
</script>

<template>
  <VueLayout name="user">
    <div class="h-full">
      <VNavbar />

      <div
        class="mt-2 py-2 flex gap-2 *:flex-shrink-0 h-[calc(100dvh-8.5rem)] overflow-y-auto justify-center"
      >
        <div class="w-full h-fit max-w-[32rem] grid gap-4">
          <VCard header="Display" icon="contrast">
            <Divider class="mt-0 my-1" />
            <div class="p-2 flex items-center gap-1 justify-between cursor-context-menu">
              <p>Dark Mode</p>
              <ToggleSwitch :default-value="isDark" @change="toggleDark()" />
            </div>
          </VCard>

          <VCard header="Account" icon="account_circle">
            <div>
              <Button
                @click="$router.push({ name: 'user-account' })"
                label="Account Details"
                fluid
                icon-pos="right"
                icon="pi pi-chevron-right"
                class="border-transparent text-slate-500 dark:text-slate-200 bg-transparent justify-between hover:bg-slate-100 dark:hover:bg-slate-800 *:font-normal"
              />
              <Divider class="my-1" />
              <Button
                @click="$router.push({ name: 'user-account', query: { 'edit-profile': 'true' } })"
                label="Edit Profile"
                fluid
                icon-pos="right"
                icon="pi pi-chevron-right"
                class="border-transparent text-slate-500 dark:text-slate-200 bg-transparent justify-between hover:bg-slate-100 dark:hover:bg-slate-800 *:font-normal"
              />
              <Divider class="my-1" />
              <Button
                @click="$router.push({ name: 'user-account' })"
                label="KYC Verification"
                fluid
                icon-pos="right"
                icon="pi pi-chevron-right"
                class="border-transparent text-slate-500 dark:text-slate-200 bg-transparent justify-between hover:bg-slate-100 dark:hover:bg-slate-800 *:font-normal"
              />
            </div>
          </VCard>

          <VCard header="Security" icon="lock">
            <div>
              <Button
                @click="$router.push({ name: 'user-change-password' })"
                label="Change Password"
                fluid
                icon-pos="right"
                icon="pi pi-chevron-right"
                class="border-transparent text-slate-500 dark:text-slate-200 bg-transparent justify-between hover:bg-slate-100 dark:hover:bg-slate-800 *:font-normal"
              />
              <Divider class="my-1" />
              <Button
                @click="$router.push({ name: 'forgot-password' })"
                label="Forgot Password"
                fluid
                icon-pos="right"
                icon="pi pi-chevron-right"
                class="border-transparent text-slate-500 dark:text-slate-200 bg-transparent justify-between hover:bg-slate-100 dark:hover:bg-slate-800 *:font-normal"
              />
            </div>
          </VCard>

          <VCard header="Help" icon="help">
            <div>
              <Button
                @click="$router.push({ name: 'user-contact' })"
                label="Report an Issue"
                fluid
                icon-pos="right"
                icon="pi pi-chevron-right"
                class="border-transparent text-slate-500 dark:text-slate-200 bg-transparent justify-between hover:bg-slate-100 dark:hover:bg-slate-800 *:font-normal"
              />
              <Divider class="my-1" />
              <Button
                @click="$router.push({ name: 'user-contact' })"
                label="Contact Us"
                fluid
                icon-pos="right"
                icon="pi pi-chevron-right"
                class="border-transparent text-slate-500 dark:text-slate-200 bg-transparent justify-between hover:bg-slate-100 dark:hover:bg-slate-800 *:font-normal"
              />
            </div>
          </VCard>

          <VCard header="About" icon="info">
            <div>
              <Button
                @click="$router.push({ name: 'about' })"
                label="About Us"
                fluid
                icon-pos="right"
                icon="pi pi-chevron-right"
                class="border-transparent text-slate-500 dark:text-slate-200 bg-transparent justify-between hover:bg-slate-100 dark:hover:bg-slate-800 *:font-normal"
              />
              <Divider class="my-1" />
              <Button
                @click="$router.push({ name: 'terms-of-use' })"
                label="Terms of Use"
                fluid
                icon-pos="right"
                icon="pi pi-chevron-right"
                class="border-transparent text-slate-500 dark:text-slate-200 bg-transparent justify-between hover:bg-slate-100 dark:hover:bg-slate-800 *:font-normal"
              />
              <Divider class="my-1" />
              <Button
                @click="$router.push({ name: 'privacy-policy' })"
                label="Privacy Policy"
                fluid
                icon-pos="right"
                icon="pi pi-chevron-right"
                class="border-transparent text-slate-500 dark:text-slate-200 bg-transparent justify-between hover:bg-slate-100 dark:hover:bg-slate-800 *:font-normal"
              />
              <Divider class="my-1" />
              <Button
                @click="$router.push({ name: 'risk-acknowledgment' })"
                label="Risk Acknowledgment"
                fluid
                icon-pos="right"
                icon="pi pi-chevron-right"
                class="border-transparent text-slate-500 dark:text-slate-200 bg-transparent justify-between hover:bg-slate-100 dark:hover:bg-slate-800 *:font-normal"
              />
            </div>
          </VCard>

          <VCard>
            <div>
              <VLogout>
                <Button
                  label="Log Out"
                  fluid
                  icon-pos="right"
                  icon="pi pi-chevron-right"
                  class="border-transparent text-slate-500 dark:text-slate-200 bg-transparent justify-between hover:bg-slate-100 dark:hover:bg-slate-800 *:font-normal"
                />
              </VLogout>
            </div>
          </VCard>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
