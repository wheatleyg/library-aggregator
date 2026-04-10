<script setup lang="ts">
const form = reactive({
  name: '',
  email: '',
  category: '',
  message: ''
})

const categories = [
  'Book recommendation',
  'Report a missing book',
  'General question',
  'Technical issue',
  'Other'
]

const submitted = ref(false)

function submit() {
  // Placeholder — wire up to an API route or email service later
  submitted.value = true
}
</script>

<template>
  <div>
    <!-- Header banner -->
    <div class="bg-elevated border-b border-default">
      <div class="mx-auto max-w-5xl px-4 py-10">
        <div class="flex items-center gap-3 mb-3">
          <UIcon
            name="i-lucide-mail"
            class="text-primary text-2xl"
          />
          <h1 class="text-3xl font-bold">
            Contact the Library
          </h1>
        </div>
        <p class="text-muted max-w-xl">
          Questions, suggestions, or something missing from the catalog? Reach out to us or stop by in person.
        </p>
      </div>
    </div>

    <div class="mx-auto max-w-5xl px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
      <!-- Contact form -->
      <div class="lg:col-span-2">
        <template v-if="!submitted">
          <h2 class="text-lg font-semibold mb-5">
            Send us a message
          </h2>

          <form
            class="flex flex-col gap-4"
            @submit.prevent="submit"
          >
            <UFormField label="Your name">
              <UInput
                v-model="form.name"
                placeholder="First Last"
                required
              />
            </UFormField>

            <UFormField label="Student email">
              <UInput
                v-model="form.email"
                type="email"
                placeholder="you@fcs.k12.in.us"
                required
              />
            </UFormField>

            <UFormField label="Category">
              <USelect
                v-model="form.category"
                :items="categories"
                placeholder="What's this about?"
              />
            </UFormField>

            <UFormField label="Message">
              <UTextarea
                v-model="form.message"
                placeholder="Tell us what's on your mind..."
                :rows="5"
                required
              />
            </UFormField>

            <UButton
              type="submit"
              label="Send message"
              trailing-icon="i-lucide-send"
              size="lg"
              class="self-start"
            />
          </form>
        </template>

        <!-- Success state -->
        <template v-else>
          <div class="rounded-2xl border border-default bg-elevated p-10 flex flex-col items-center text-center gap-4">
            <div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <UIcon
                name="i-lucide-check"
                class="text-primary text-2xl"
              />
            </div>
            <h2 class="text-xl font-semibold">
              Message sent!
            </h2>
            <p class="text-muted max-w-sm">
              Thanks for reaching out. We'll get back to you within one school day.
            </p>
            <UButton
              variant="outline"
              label="Send another"
              @click="submitted = false; Object.assign(form, { name: '', email: '', category: '', message: '' })"
            />
          </div>
        </template>
      </div>

      <!-- Sidebar info -->
      <div class="flex flex-col gap-5">
        <div class="rounded-2xl border border-default bg-elevated p-5 flex flex-col gap-4">
          <h2 class="font-semibold">
            Find us
          </h2>

          <div class="flex flex-col gap-3 text-sm">
            <div class="flex gap-3">
              <UIcon
                name="i-lucide-map-pin"
                class="text-primary mt-0.5 shrink-0"
              />
              <div>
                <p class="font-medium">Franklin Central High School</p>
                <p class="text-muted">6215 E. Southeastern Ave<br>Indianapolis, IN 46203</p>
              </div>
            </div>

            <div class="flex gap-3">
              <UIcon
                name="i-lucide-mail"
                class="text-primary mt-0.5 shrink-0"
              />
              <div>
                <p class="font-medium">Email</p>
                <a
                  href="mailto:library@fcs.k12.in.us"
                  class="text-muted hover:text-primary transition-colors"
                >library@fcs.k12.in.us</a>
              </div>
            </div>

            <div class="flex gap-3">
              <UIcon
                name="i-lucide-clock"
                class="text-primary mt-0.5 shrink-0"
              />
              <div>
                <p class="font-medium">Hours</p>
                <p class="text-muted">Mon–Fri: 7:30 AM – 4:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-default bg-elevated p-5">
          <h2 class="font-semibold mb-2">
            Need a book?
          </h2>
          <p class="text-sm text-muted mb-3">
            Can't find what you're looking for in the catalog? Let us know and we'll see if we can get it.
          </p>
          <UButton
            to="/catalog"
            variant="outline"
            label="Search the catalog"
            icon="i-lucide-search"
            size="sm"
            block
          />
        </div>
      </div>
    </div>
  </div>
</template>
