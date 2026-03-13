<script setup>
useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: { lang: 'en' }
})

const title = 'Nuxt Starter Template'
const description = 'A production-ready starter template powered by Nuxt UI...'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image'
})

const page = ref(1)
const itemsPerPage = 12

const books = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Book ${i + 1}`
}))

const { data: bookData } = await useFetch('/api/books')
console.log(bookData)

const totalItems = computed(() => bookData.value?.books?.length || 0)

const paginatedBooks = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return bookData.value.books.slice(start,end)
})
const message = ref(null)
async function ping() {
  const data = await $fetch('/api/heartbeat')
  message.value = data.message
  console.log(message.value)
}
onMounted(() => {
  ping()
  const interval = setInterval(ping, 1000 * 10)
  onUnmounted(() => clearInterval(interval))
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/">
          <AppLogo class="w-auto h-6 shrink-0" />
        </NuxtLink>
        <TemplateMenu />
      </template>

      <template #right>
        <UColorModeButton />
        <UButton
          to="https://github.com/nuxt-ui-templates/starter"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UHeader>

    <UMain>
      <UButton @click="ping">
        Ping
      </UButton>
      <p v-if="message">
        {{ message }}
      </p>
      <NuxtPage />
      <template v-if="bookData">
        <!-- Books grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
          <BookTemplate
            v-for="book in paginatedBooks"
            :key="book.id"
            class="flex flex-col items-center"
            :image="book.imageUrl"
            :label="book.title"
          />
        </div>

        <!-- Centered pagination -->
        <div class="flex justify-center mt-6">
          <UPagination
            v-model:page="page"
            :total="totalItems"
            :items-per-page="itemsPerPage"
            show-edges
          />
        </div>

        <p class="mt-2 text-center text-xs text-muted">
          Items per page: {{ itemsPerPage }}
        </p>
      </template>
    </UMain>

    <USeparator />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Made by WebDev Class | gwheatley@ftstudent.org
        </p>
      </template>
      <BookTemplate />

      <template #right>
        <UButton
          to="https://github.com/nuxt-ui-templates/starter"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </UApp>
</template>
