<script setup lang="ts">
const { data: seriesList, status } = await useAsyncData('series-list', () => $fetch<{
  id: number; name: string; description: string | null; bookCount: number; coverUrl: string | null
}[]>('/api/series'))
</script>

<template>
  <div>
    <div class="bg-elevated border-b border-default">
      <div class="mx-auto max-w-6xl px-4 py-10">
        <div class="flex items-center gap-3 mb-3">
          <UIcon name="i-lucide-layers" class="text-primary text-2xl" />
          <h1 class="text-3xl font-bold">Series</h1>
        </div>
        <p class="text-muted max-w-xl">
          Browse books by series — read them in order or jump into any universe.
        </p>
      </div>
    </div>

    <div class="mx-auto max-w-6xl px-4 py-10">
      <template v-if="status === 'pending'">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          <div v-for="i in 8" :key="i" class="animate-pulse flex flex-col gap-2">
            <div class="rounded-2xl bg-muted w-full aspect-[2/3]" />
            <div class="h-4 bg-muted rounded w-3/4" />
            <div class="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      </template>

      <template v-else-if="seriesList?.length">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          <NuxtLink
            v-for="s in seriesList"
            :key="s.id"
            :to="`/series/${s.id}`"
            class="group flex flex-col gap-2"
          >
            <div class="rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
              <NuxtImg
                v-if="s.coverUrl"
                :src="s.coverUrl"
                :alt="s.name"
                class="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                fit="cover"
              />
              <div
                v-else
                class="w-full aspect-[2/3] bg-muted flex flex-col items-center justify-center gap-2"
              >
                <UIcon name="i-lucide-layers" class="text-3xl text-muted-foreground" />
              </div>
            </div>
            <p class="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
              {{ s.name }}
            </p>
            <p class="text-xs text-muted">{{ s.bookCount }} book{{ s.bookCount !== 1 ? 's' : '' }}</p>
          </NuxtLink>
        </div>
      </template>

      <template v-else>
        <UEmpty
          icon="i-lucide-layers"
          label="No series yet"
          description="Series will appear here once the admin creates them."
        />
      </template>
    </div>
  </div>
</template>
