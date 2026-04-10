<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string

// Primary book data — loads fast from DB
const { data: book, status } = await useAsyncData(
  `book-${id}`,
  () => $fetch<{
    id: number
    title: string
    author: string | null
    isbn: string | null
    lccn: string | null
    callNumber: string
    imageUrl: string | null
    description: string | null
    genre: string | null
  }>(`/api/books/${id}`)
)

// AI enrichment — only fires if description/genre aren't cached on the book yet
const enriched = ref<{ description: string; genre: string } | null>(null)
const enrichLoading = ref(false)

const description = computed(() => enriched.value?.description ?? book.value?.description ?? null)
const genre = computed(() => enriched.value?.genre ?? book.value?.genre ?? null)

onMounted(async () => {
  if (!book.value) return

  // Track this view
  $fetch(`/api/view/${id}`, { method: 'POST' }).catch(() => {})

  // Already have both fields cached in DB — no need to call AI
  if (book.value.description && book.value.genre) return

  enrichLoading.value = true
  try {
    const result = await $fetch<{ description: string; genre: string }>(`/api/enrich/${id}`)
    enriched.value = result
  } catch (e) {
    console.error('Enrichment failed', e)
  } finally {
    enrichLoading.value = false
  }
})
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-10">
    <!-- Back -->
    <UButton
      to="/catalog"
      variant="ghost"
      color="neutral"
      icon="i-lucide-arrow-left"
      label="Back to catalog"
      size="sm"
      class="mb-8"
    />

    <!-- Loading skeleton -->
    <template v-if="status === 'pending'">
      <div class="flex flex-col sm:flex-row gap-10 animate-pulse">
        <div class="rounded-2xl bg-muted w-48 aspect-[2/3] shrink-0" />
        <div class="flex-1 flex flex-col gap-3 pt-2">
          <div class="h-8 bg-muted rounded w-3/4" />
          <div class="h-5 bg-muted rounded w-1/3" />
          <div class="h-4 bg-muted rounded w-full mt-4" />
          <div class="h-4 bg-muted rounded w-full" />
          <div class="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    </template>

    <!-- Book detail -->
    <template v-else-if="book">
      <div class="flex flex-col sm:flex-row gap-10">
        <!-- Cover -->
        <div class="shrink-0 flex justify-center sm:block">
          <div class="w-44 sm:w-52 rounded-2xl overflow-hidden shadow-xl">
            <NuxtImg
              v-if="book.imageUrl"
              :src="book.imageUrl"
              :alt="book.title"
              class="w-full aspect-[2/3] object-cover"
              fit="cover"
            />
            <div
              v-else
              class="w-full aspect-[2/3] bg-muted flex items-center justify-center"
            >
              <UIcon
                name="i-lucide-book"
                class="text-4xl text-muted-foreground"
              />
            </div>
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <!-- Genre + Series badges -->
          <div class="mb-3 flex flex-wrap gap-2 min-h-6">
            <UBadge
              v-if="genre"
              :label="genre"
              variant="subtle"
              color="primary"
            />
            <div
              v-else-if="enrichLoading"
              class="inline-block h-5 w-20 bg-muted rounded animate-pulse"
            />
            <NuxtLink v-if="book.series" :to="`/series/${book.series.id}`">
              <UBadge
                :label="`${book.series.name} #${book.seriesOrder}`"
                variant="subtle"
                color="neutral"
                icon="i-lucide-layers"
              />
            </NuxtLink>
          </div>

          <h1 class="text-3xl font-bold leading-tight">
            {{ book.title }}
          </h1>

          <p
            v-if="book.author"
            class="mt-2 text-lg text-muted"
          >
            by {{ book.author }}
          </p>

          <!-- AI Description -->
          <div class="mt-5 min-h-[4rem]">
            <p
              v-if="description"
              class="text-base leading-relaxed"
            >
              {{ description }}
            </p>
            <div
              v-else-if="enrichLoading"
              class="flex flex-col gap-2 animate-pulse"
            >
              <div class="h-4 bg-muted rounded w-full" />
              <div class="h-4 bg-muted rounded w-full" />
              <div class="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>

          <USeparator class="my-6" />

          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div v-if="book.callNumber">
              <dt class="text-muted font-medium mb-0.5">
                Call Number
              </dt>
              <dd class="font-mono">
                {{ book.callNumber }}
              </dd>
            </div>

            <div>
              <dt class="text-muted font-medium mb-0.5">
                ISBN
              </dt>
              <dd class="font-mono">
                {{ book.isbn ?? '—' }}
              </dd>
            </div>

            <div v-if="book.lccn">
              <dt class="text-muted font-medium mb-0.5">
                LCCN
              </dt>
              <dd class="font-mono">
                {{ book.lccn }}
              </dd>
            </div>
          </dl>

          <div class="mt-8 flex flex-wrap gap-3">
            <UButton
              label="Find on shelf"
              icon="i-lucide-map-pin"
              size="lg"
              disabled
            />
            <UButton
              to="/catalog"
              label="Browse more books"
              icon="i-lucide-library"
              variant="outline"
              size="lg"
            />
          </div>

          <p class="mt-4 text-xs text-muted">
            Available at the Franklin Central High School Library. See a librarian if you need help locating this book.
          </p>
        </div>
      </div>
    </template>

    <!-- Not found -->
    <template v-else>
      <UEmpty
        icon="i-lucide-book-x"
        label="Book not found"
        description="This book doesn't exist in the catalog. It may have been removed."
      >
        <template #actions>
          <UButton
            to="/catalog"
            label="Back to catalog"
          />
        </template>
      </UEmpty>
    </template>
  </div>
</template>
