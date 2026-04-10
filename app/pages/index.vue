<script setup lang="ts">
const GENRES = ['Fiction', 'Non-Fiction', 'Fantasy', 'Biography', 'Science Fiction', 'Romance', 'Horror', 'Historical']

const page = ref(1)
const itemsPerPage = 12

const { data: bookData, status } = await useAsyncData(
  () => `home-books-${page.value}`,
  () => $fetch('/api/books', {
    query: { page: page.value, limit: itemsPerPage, sort: 'popular' }
  })
)

const totalItems = computed(() => bookData.value?.total || 0)
const paginatedBooks = computed(() => bookData.value?.books ?? [])
</script>

<template>
  <div>
    <!-- Hero / Search Banner -->
    <section class="relative overflow-hidden bg-primary py-20 px-4">
      <!-- Subtle grid overlay -->
      <div
        class="pointer-events-none absolute inset-0 opacity-10"
        style="background-image: linear-gradient(0deg, transparent 24%, rgba(255,255,255,.3) 25%, rgba(255,255,255,.3) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.3) 75%, rgba(255,255,255,.3) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.3) 25%, rgba(255,255,255,.3) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.3) 75%, rgba(255,255,255,.3) 76%, transparent 77%); background-size: 48px 48px;"
      />

      <div class="relative mx-auto max-w-4xl flex flex-col items-center text-center gap-6">
        <div class="flex items-center gap-3 mb-2">
          <AppLogo class="h-10 w-auto brightness-0 invert" />
          <span class="text-white/80 text-sm font-semibold uppercase tracking-widest">FCHS Library</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
          Discover Your Next<br>
          <span class="text-blue-200">Great Read</span>
        </h1>

        <p class="text-blue-100 text-lg max-w-xl">
          Explore thousands of books available at Franklin Central High School Library.
          Search the catalog, find what's popular, and more — all in one place.
        </p>

        <SearchBar />

        <div class="flex flex-wrap justify-center gap-3 mt-2">
          <UButton
            to="/catalog"
            variant="outline"
            color="white"
            size="sm"
            label="Browse Catalog"
            trailing-icon="i-lucide-arrow-right"
          />
          <UButton
            to="/events"
            variant="ghost"
            color="white"
            size="sm"
            label="Library Events"
          />
        </div>
      </div>
    </section>

    <!-- Quick links strip -->
    <section class="border-b border-default bg-elevated/50">
      <div class="mx-auto max-w-6xl px-4 py-4 flex flex-wrap gap-2 justify-center sm:justify-start">
        <NuxtLink
          v-for="genre in GENRES"
          :key="genre"
          :to="`/catalog?genre=${encodeURIComponent(genre)}`"
        >
          <UBadge
            variant="subtle"
            color="primary"
            class="hover:bg-primary/20 transition-colors cursor-pointer"
            :label="genre"
          />
        </NuxtLink>
      </div>
    </section>

    <!-- Hot Books Section -->
    <section class="mx-auto max-w-6xl px-4 py-12">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <UIcon name="i-lucide-trending-up" class="text-primary" />
            Popular Picks
          </h2>
          <p class="text-muted text-sm mt-1">
            Books students at Franklin Central are reading right now
          </p>
        </div>
        <UButton
          to="/catalog"
          variant="ghost"
          label="View all"
          trailing-icon="i-lucide-arrow-right"
          size="sm"
        />
      </div>

      <!-- Skeleton loader -->
      <template v-if="status === 'pending'">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          <div
            v-for="i in itemsPerPage"
            :key="i"
            class="flex flex-col items-center animate-pulse"
          >
            <div class="rounded-2xl bg-muted w-full aspect-[2/3]" />
            <div class="mt-2 h-3 bg-muted rounded w-3/4" />
            <div class="mt-1 h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      </template>

      <!-- Books grid -->
      <template v-else-if="paginatedBooks.length">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          <BookCard
            v-for="book in paginatedBooks"
            :key="book.id"
            :id="book.id"
            :image="book.imageUrl"
            :title="book.title"
            :author="book.author"
          />
        </div>

        <div class="flex justify-center mt-10">
          <UPagination
            v-model:page="page"
            :total="totalItems"
            :items-per-page="itemsPerPage"
            show-edges
          />
        </div>
      </template>

      <template v-else>
        <UEmpty
          icon="i-lucide-book-open"
          label="No books found"
          description="The catalog appears to be empty right now."
        />
      </template>
    </section>
  </div>
</template>
