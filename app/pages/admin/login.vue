<script setup lang="ts">
definePageMeta({ layout: false })

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function login() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    })
    await navigateTo('/admin')
  } catch {
    error.value = 'Invalid username or password.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-default flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="flex justify-center mb-6">
        <AppLogo class="h-10 w-auto" />
      </div>

      <div class="rounded-2xl border border-default bg-elevated p-8 shadow-lg backdrop-blur">
        <h1 class="text-xl font-bold text-center mb-1">
          Admin Login
        </h1>
        <p class="text-sm text-muted text-center mb-6">
          FC Library Administration
        </p>

        <form
          class="flex flex-col gap-4"
          @submit.prevent="login"
        >
          <UFormField label="Username">
            <UInput
              v-model="username"
              placeholder="admin"
              autocomplete="username"
              required
            />
          </UFormField>

          <UFormField label="Password">
            <UInput
              v-model="password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
          </UFormField>

          <UAlert
            v-if="error"
            color="error"
            variant="subtle"
            :description="error"
            icon="i-lucide-alert-circle"
          />

          <UButton
            type="submit"
            label="Sign in"
            :loading="loading"
            block
            size="lg"
            icon="i-lucide-log-in"
          />
        </form>
      </div>

      <p class="text-center mt-4 text-xs text-muted">
        <NuxtLink
          to="/"
          class="hover:text-primary transition-colors"
        >
          ← Back to library
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
