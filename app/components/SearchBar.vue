<script setup>
const query = ref('')
const router = useRouter()

function search() {
  if (query.value.trim()) {
    router.push({ path: '/catalog', query: { q: query.value.trim() } })
  }
}
</script>

<template>
  <form
    class="flex w-full max-w-2xl gap-2"
    @submit.prevent="search"
  >
    <UInput
      v-model="query"
      size="xl"
      placeholder="Search by title, author, or ISBN..."
      icon="i-lucide-search"
      class="flex-1"
      :ui="{ base: 'rounded-xl' }"
    />
    <UButton
      type="submit"
      size="xl"
      label="Search"
      class="rounded-xl px-6 font-semibold"
    />
  </form>
</template>
