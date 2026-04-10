<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const GENRES = ['Fiction', 'Non-Fiction', 'Fantasy', 'Biography', 'Science Fiction', 'Romance', 'Horror', 'Historical']

const searchQuery = ref((route.query.q as string) || '')
const activeGenre = ref((route.query.genre as string) || '')
const sort = ref((route.query.sort as string) || 'popular')
const page = ref(1)
const itemsPerPage = 24

const sortOptions = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Title (A–Z)', value: 'title' },
  { label: 'Author (A–Z)', value: 'author' },
  { label: 'Recently Added', value: 'recent' }
]

const { data: bookData, status } = await useAsyncData(
  () => `catalog-${searchQuery.value}-${sort.value}-${activeGenre.value}-${page.value}`,
  () => $fetch('/api/books', {
    query: {
      page: page.value,
      limit: itemsPerPage,
      search: searchQuery.value || undefined,
      sort: sort.value,
      genre: activeGenre.value || undefined
    }
  })
)

const totalItems = computed(() => bookData.value?.total || 0)
const paginatedBooks = computed(() => bookData.value?.books ?? [])

function applyFilters() {
  page.value = 1
  router.replace({
    query: {
      q: searchQuery.value || undefined,
      genre: activeGenre.value || undefined,
      sort: sort.value !== 'popular' ? sort.value : undefined
    }
  })
}

function toggleGenre(genre: string) {
  activeGenre.value = activeGenre.value === genre ? '' : genre
  applyFilters()
}

function clearAll() {
  searchQuery.value = ''
  activeGenre.value = ''
  sort.value = 'popular'
  applyFilters()
}

// Sync URL → state when navigating in from homepage genre badges or search bar
watch(() => route.query, (q) => {
  searchQuery.value = (q.q as string) || ''
  activeGenre.value = (q.genre as string) || ''
  page.value = 1
})
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="bg-elevated border-b border-default">
      <div class="mx-auto max-w-6xl px-4 py-8">
        <h1 class="text-3xl font-bold mb-1">
          Book Catalog
        </h1>
        <p class="text-muted text-sm">
          Browse all books available at the Franklin Central High School Library
        </p>

        <!-- Search + Sort -->
        <form
          class="mt-5 flex flex-col sm:flex-row gap-3"
          @submit.prevent="applyFilters"
        >
          <UInput
            v-model="searchQuery"
            size="lg"
            placeholder="Search by title, author, or ISBN..."
            icon="i-lucide-search"
            class="flex-1"
          />
          <USelect
            v-model="sort"
            :items="sortOptions"
            value-key="value"
            label-key="label"
            size="lg"
            class="w-full sm:w-52"
            @update:model-value="applyFilters"
          />
          <UButton
            type="submit"
            size="lg"
            label="Search"
            icon="i-lucide-search"
          />
        </form>

        <!-- Genre chips -->
        <div class="mt-4 flex flex-wrap gap-2">
          <UButton
            v-for="genre in GENRES"
            :key="genre"
            :label="genre"
            size="xs"
            :variant="activeGenre === genre ? 'solid' : 'outline'"
            :color="activeGenre === genre ? 'primary' : 'neutral'"
            class="rounded-full"
            @click="toggleGenre(genre)"
          />
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-6xl px-4 py-8">
      <!-- Results bar -->
      <div class="flex items-center justify-between mb-6 text-sm text-muted">
        <span v-if="status !== 'pending'">
          <template v-if="searchQuery || activeGenre">
            <strong class="text-default">{{ totalItems }}</strong> result{{ totalItems !== 1 ? 's' : '' }}
            <template v-if="searchQuery"> for "<strong class="text-default">{{ searchQuery }}</strong>"</template>
            <template v-if="activeGenre"> in <strong class="text-default">{{ activeGenre }}</strong></template>
          </template>
          <template v-else>
            <strong class="text-default">{{ totalItems }}</strong> books in the catalog
          </template>
        </span>
        <span
          v-else
          class="animate-pulse bg-muted rounded h-4 w-32 inline-block"
        />

        <UButton
          v-if="searchQuery || activeGenre"
          variant="ghost"
          size="xs"
          label="Clear all"
          icon="i-lucide-x"
          color="neutral"
          @click="clearAll"
        />
      </div>

      <!-- Skeleton -->
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

        <div class="flex flex-col items-center gap-2 mt-10">
          <UPagination
            v-model:page="page"
            :total="totalItems"
            :items-per-page="itemsPerPage"
            show-edges
          />
          <p class="text-xs text-muted">
            Page {{ page }} of {{ Math.ceil(totalItems / itemsPerPage) }}
          </p>
        </div>
      </template>

      <!-- Empty state -->
      <template v-else>
        <UEmpty
          icon="i-lucide-search-x"
          :label="searchQuery || activeGenre ? 'No books match your filters' : 'No books found'"
          :description="searchQuery || activeGenre ? 'Try different keywords or clear the genre filter.' : 'The catalog appears to be empty.'"
        >
          <template
            v-if="searchQuery || activeGenre"
            #actions
          >
            <UButton
              variant="outline"
              label="Clear all filters"
              @click="clearAll"
            />
          </template>
        </UEmpty>
      </template>
    </div>
  </div>
</template>
