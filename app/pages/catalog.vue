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

watch(() => route.query, (q) => {
  searchQuery.value = (q.q as string) || ''
  activeGenre.value = (q.genre as string) || ''
  page.value = 1
})
</script>

<template>
  <div class="catalog-root">

    <!-- Decorative background -->
    <div class="bg-pattern" aria-hidden="true">
      <div class="grid-lines" />
      <div class="orb orb-1" />
      <div class="orb orb-2" />
    </div>

    <!-- Header -->
    <header class="header-band">
      <div class="inner">
        <div class="header-eyebrow">
          <span class="eyebrow-dot" />
          Franklin Central Library
        </div>
        <h1 class="header-title">Book Catalog</h1>
        <p class="header-sub">
          Browse all books available at the Franklin Central High School Library
        </p>

        <!-- Search + Sort -->
        <form class="search-row" @submit.prevent="applyFilters">
          <UInput
            v-model="searchQuery"
            size="lg"
            placeholder="Search by title, author, or ISBN…"
            icon="i-lucide-search"
            class="search-input"
          />
          <USelect
            v-model="sort"
            :items="sortOptions"
            value-key="value"
            label-key="label"
            size="lg"
            class="sort-select"
            @update:model-value="applyFilters"
          />
          <UButton
            type="submit"
            size="lg"
            label="Search"
            icon="i-lucide-search"
            class="search-btn"
          />
        </form>

        <!-- Genre chips -->
        <div class="genre-chips">
          <button
            v-for="genre in GENRES"
            :key="genre"
            class="genre-chip"
            :class="{ active: activeGenre === genre }"
            @click="toggleGenre(genre)"
          >
            {{ genre }}
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="inner content-area">

      <!-- Results bar -->
      <div class="results-bar">
        <span v-if="status !== 'pending'" class="results-count">
          <template v-if="searchQuery || activeGenre">
            <strong>{{ totalItems }}</strong> result{{ totalItems !== 1 ? 's' : '' }}
            <template v-if="searchQuery"> for "<strong>{{ searchQuery }}</strong>"</template>
            <template v-if="activeGenre"> in <strong>{{ activeGenre }}</strong></template>
          </template>
          <template v-else>
            <strong>{{ totalItems }}</strong> books in the catalog
          </template>
        </span>
        <span v-else class="skeleton-line" style="width: 8rem;" />

        <button
          v-if="searchQuery || activeGenre"
          class="clear-btn"
          @click="clearAll"
        >
          <UIcon name="i-lucide-x" />
          Clear all
        </button>
      </div>

      <!-- Skeleton -->
      <template v-if="status === 'pending'">
        <div class="book-grid">
          <div v-for="i in itemsPerPage" :key="i" class="skeleton-card">
            <div class="skeleton-cover" />
            <div class="skeleton-line" style="width: 75%; margin-top: .625rem;" />
            <div class="skeleton-line" style="width: 50%; margin-top: .375rem;" />
          </div>
        </div>
      </template>

      <!-- Books grid -->
      <template v-else-if="paginatedBooks.length">
        <div class="book-grid">
          <BookCard
            v-for="book in paginatedBooks"
            :key="book.id"
            :id="book.id"
            :image="book.imageUrl"
            :title="book.title"
            :author="book.author"
          />
        </div>

        <div class="pagination-wrap">
          <UPagination
            v-model:page="page"
            :total="totalItems"
            :items-per-page="itemsPerPage"
            show-edges
          />
          <p class="page-hint">
            Page {{ page }} of {{ Math.ceil(totalItems / itemsPerPage) }}
          </p>
        </div>
      </template>

      <!-- Empty state -->
      <template v-else>
        <div class="empty-state">
          <div class="empty-icon-wrap">
            <UIcon name="i-lucide-search-x" class="empty-icon" />
          </div>
          <h2 class="empty-title">
            {{ searchQuery || activeGenre ? 'No books match your filters' : 'No books found' }}
          </h2>
          <p class="empty-body">
            {{ searchQuery || activeGenre
            ? 'Try different keywords or clear the genre filter.'
            : 'The catalog appears to be empty.' }}
          </p>
          <button v-if="searchQuery || activeGenre" class="genre-chip active" @click="clearAll">
            Clear all filters
          </button>
        </div>
      </template>

    </main>
  </div>
</template>

<style scoped>
/* ── Tokens ── */
.catalog-root {
  --accent: var(--color-primary-500, #3b82f6);
  --accent-soft: color-mix(in srgb, var(--accent) 10%, transparent);
  --radius-card: 1.25rem;
  --shadow-card: 0 1px 3px rgba(0,0,0,.07), 0 8px 24px rgba(0,0,0,.06);
  --font-display: 'Georgia', 'Times New Roman', serif;

  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

/* ── Decorative background (shared) ── */
.bg-pattern {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.grid-lines {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, var(--color-gray-200, #e5e7eb) 1px, transparent 1px),
    linear-gradient(to bottom, var(--color-gray-200, #e5e7eb) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 0.35;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 0%, black 30%, transparent 100%);
}
.dark .grid-lines {
  background-image:
    linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,.05) 1px, transparent 1px);
  opacity: 1;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: .18;
}
.orb-1 { width: 520px; height: 520px; top: -160px; right: -80px; background: var(--accent); }
.orb-2 { width: 340px; height: 340px; bottom: 10%; left: -60px; background: color-mix(in srgb, var(--accent) 60%, #10b981); }

/* ── Layout ── */
.inner {
  position: relative;
  z-index: 1;
  max-width: 76rem;
  margin-inline: auto;
  padding-inline: clamp(1rem, 4vw, 2.5rem);
}

/* ── Header ── */
.header-band {
  padding-block: 3.5rem 2rem;
  position: relative;
  z-index: 1;
}

.header-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  font-size: .75rem;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 1rem;
}

.eyebrow-dot {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: .5; transform: scale(1.4); }
}

.header-title {
  font-family: var(--font-display);
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -.02em;
  color: var(--color-gray-900, #111827);
  margin-bottom: .875rem;
}
.dark .header-title { color: var(--color-gray-50, #f9fafb); }

.header-sub {
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--color-gray-500, #6b7280);
  max-width: 52ch;
  margin-bottom: 1.75rem;
}

/* ── Search row ── */
.search-row {
  display: flex;
  flex-direction: column;
  gap: .75rem;
}
@media (min-width: 640px) {
  .search-row { flex-direction: row; }
}

.search-input { flex: 1; }

.sort-select { width: 100%; }
@media (min-width: 640px) { .sort-select { width: 13rem; flex-shrink: 0; } }

.search-btn {
  transition: transform .15s ease, box-shadow .15s ease;
  flex-shrink: 0;
}
.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent) 30%, transparent);
}

/* ── Genre chips ── */
.genre-chips {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  margin-top: 1rem;
}

.genre-chip {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  padding: .3125rem .875rem;
  border-radius: 99px;
  font-size: .8125rem;
  font-weight: 500;
  border: 1px solid var(--color-gray-300, #d1d5db);
  background: transparent;
  color: var(--color-gray-600, #4b5563);
  cursor: pointer;
  transition: all .15s ease;
  line-height: 1;
}
.genre-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}
.genre-chip.active {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}

.dark .genre-chip {
  border-color: var(--color-gray-700, #374151);
  color: var(--color-gray-400, #9ca3af);
}
.dark .genre-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.dark .genre-chip.active { color: #fff; }

/* ── Content area ── */
.content-area {
  padding-block: 2rem 5rem;
}

/* ── Results bar ── */
.results-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.75rem;
  min-height: 1.75rem;
}

.results-count {
  font-size: .875rem;
  color: var(--color-gray-500, #6b7280);
}
.results-count strong {
  color: var(--color-gray-800, #1f2937);
  font-weight: 600;
}
.dark .results-count strong { color: var(--color-gray-200, #e5e7eb); }

.clear-btn {
  display: inline-flex;
  align-items: center;
  gap: .375rem;
  font-size: .8125rem;
  font-weight: 500;
  color: var(--color-gray-500, #6b7280);
  background: none;
  border: none;
  cursor: pointer;
  padding: .25rem .5rem;
  border-radius: .375rem;
  transition: color .15s ease, background .15s ease;
}
.clear-btn:hover {
  color: var(--color-gray-800, #1f2937);
  background: var(--color-gray-100, #f3f4f6);
}
.dark .clear-btn:hover {
  color: var(--color-gray-100, #f3f4f6);
  background: var(--color-gray-800, #1f2937);
}

/* ── Book grid ── */
.book-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}
@media (min-width: 480px)  { .book-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 768px)  { .book-grid { grid-template-columns: repeat(4, 1fr); } }
@media (min-width: 1024px) { .book-grid { grid-template-columns: repeat(5, 1fr); } }
@media (min-width: 1280px) { .book-grid { grid-template-columns: repeat(6, 1fr); } }

/* ── Skeleton ── */
.skeleton-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: shimmer 1.4s ease-in-out infinite;
}

.skeleton-cover {
  width: 100%;
  aspect-ratio: 2 / 3;
  border-radius: .875rem;
  background: var(--color-gray-200, #e5e7eb);
}
.dark .skeleton-cover { background: var(--color-gray-800, #1f2937); }

.skeleton-line {
  height: .6875rem;
  border-radius: 99px;
  background: var(--color-gray-200, #e5e7eb);
  display: block;
}
.dark .skeleton-line { background: var(--color-gray-800, #1f2937); }

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50%       { opacity: .5; }
}

/* ── Pagination ── */
.pagination-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .625rem;
  margin-top: 3rem;
}

.page-hint {
  font-size: .75rem;
  color: var(--color-gray-400, #9ca3af);
}

/* ── Empty state ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-block: 5rem;
  gap: 1rem;
}

.empty-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem; height: 4rem;
  border-radius: 1rem;
  background: var(--accent-soft);
  margin-bottom: .5rem;
}

.empty-icon {
  font-size: 1.75rem;
  color: var(--accent);
}

.empty-title {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 600;
  color: var(--color-gray-800, #1f2937);
}
.dark .empty-title { color: var(--color-gray-100, #f3f4f6); }

.empty-body {
  font-size: .9375rem;
  color: var(--color-gray-500, #6b7280);
  max-width: 36ch;
  line-height: 1.6;
}
</style>
