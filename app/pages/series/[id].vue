<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string

const { data: series, status } = await useAsyncData(
  `series-${id}`,
  () => $fetch<{
    id: number; name: string; description: string | null
    books: { id: number; title: string; author: string | null; imageUrl: string | null; genre: string | null; order: number }[]
  }>(`/api/series/${id}`)
)
</script>

<template>
  <div>
    <!-- Back -->
    <div class="mx-auto max-w-5xl px-4 pt-8">
      <UButton to="/series" variant="ghost" color="neutral" icon="i-lucide-arrow-left" label="All series" size="sm" class="mb-6" />
    </div>

    <template v-if="status === 'pending'">
      <div class="mx-auto max-w-5xl px-4 animate-pulse">
        <div class="h-8 bg-muted rounded w-1/3 mb-2" />
        <div class="h-4 bg-muted rounded w-2/3 mb-10" />
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          <div v-for="i in 5" :key="i" class="flex flex-col gap-2">
            <div class="rounded-2xl bg-muted w-full aspect-[2/3]" />
            <div class="h-3 bg-muted rounded w-3/4" />
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="series">
      <div class="mx-auto max-w-5xl px-4 pb-12">
        <div class="mb-8">
          <div class="flex items-center gap-2 mb-1">
            <UIcon name="i-lucide-layers" class="text-primary" />
            <span class="text-sm text-muted font-medium uppercase tracking-wide">Series</span>
          </div>
          <h1 class="text-4xl font-extrabold leading-tight">{{ series.name }}</h1>
          <p v-if="series.description" class="text-muted mt-2 max-w-xl">{{ series.description }}</p>
          <p class="text-sm text-muted mt-1">{{ series.books.length }} book{{ series.books.length !== 1 ? 's' : '' }}</p>
        </div>

        <div v-if="series.books.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          <NuxtLink
            v-for="book in series.books"
            :key="book.id"
            :to="`/books/${book.id}`"
            class="group flex flex-col gap-2"
          >
            <div class="relative">
              <div class="rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
                <NuxtImg
                  v-if="book.imageUrl"
                  :src="book.imageUrl"
                  :alt="book.title"
                  class="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                  fit="cover"
                />
                <div
                  v-else
                  class="w-full aspect-[2/3] bg-muted flex items-center justify-center"
                >
                  <UIcon name="i-lucide-book" class="text-2xl text-muted-foreground" />
                </div>
              </div>
              <!-- Order badge -->
              <div class="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {{ book.order }}
              </div>
            </div>
            <p class="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {{ book.title }}
            </p>
            <p class="text-xs text-muted truncate">{{ book.author }}</p>
          </NuxtLink>
        </div>

        <UEmpty
          v-else
          icon="i-lucide-book"
          label="No books in this series yet"
          description="Books can be assigned to this series from the admin panel."
        />
      </div>
    </template>

    <template v-else>
      <div class="mx-auto max-w-5xl px-4 py-12">
        <UEmpty icon="i-lucide-layers" label="Series not found" description="This series doesn't exist.">
          <template #actions>
            <UButton to="/series" label="Back to series" />
          </template>
        </UEmpty>
      </div>
    </template>
  </div>
</template>
