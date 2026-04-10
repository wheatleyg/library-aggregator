<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

type SeriesEntry = {
  id: number; name: string; description: string | null; bookCount: number
  coverUrl: string | null
  books: { id: number; title: string; author: string | null; imageUrl: string | null; order: number }[]
}

type BookEntry = {
  id: number; title: string; author: string | null; callNumber: string
  imageUrl: string | null; seriesId: number | null; seriesOrder: number
}

const { data: series, refresh: refreshSeries } = await useAsyncData('admin-series', () =>
  $fetch<SeriesEntry[]>('/api/admin/series')
)

const { data: allBooks, refresh: refreshBooks } = await useAsyncData('admin-all-books-for-series', () =>
  $fetch<BookEntry[]>('/api/admin/books')
)

// ── Create / Edit series ──────────────────────────────────────────────────
const slideoverOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const saveError = ref('')
const form = reactive({ name: '', description: '' })

function openCreate() {
  Object.assign(form, { name: '', description: '' })
  isEditing.value = false; editingId.value = null; saveError.value = ''
  slideoverOpen.value = true
}

function openEdit(s: SeriesEntry) {
  Object.assign(form, { name: s.name, description: s.description ?? '' })
  isEditing.value = true; editingId.value = s.id; saveError.value = ''
  slideoverOpen.value = true
}

async function saveSeries() {
  if (!form.name.trim()) { saveError.value = 'Name is required.'; return }
  saving.value = true; saveError.value = ''
  try {
    if (isEditing.value) {
      await $fetch(`/api/admin/series/${editingId.value}`, { method: 'PATCH', body: form })
    } else {
      await $fetch('/api/admin/series', { method: 'POST', body: form })
    }
    slideoverOpen.value = false
    await refreshSeries()
  } catch {
    saveError.value = 'Could not save. Name must be unique.'
  } finally {
    saving.value = false
  }
}

// ── Delete series ─────────────────────────────────────────────────────────
const deleteConfirmId = ref<number | null>(null)
let deleteTimer: ReturnType<typeof setTimeout>

async function handleDelete(id: number) {
  if (deleteConfirmId.value !== id) {
    deleteConfirmId.value = id
    clearTimeout(deleteTimer)
    deleteTimer = setTimeout(() => { deleteConfirmId.value = null }, 3000)
    return
  }
  deleteConfirmId.value = null
  await $fetch(`/api/admin/series/${id}`, { method: 'DELETE' })
  await Promise.all([refreshSeries(), refreshBooks()])
}

// ── Expand / collapse ─────────────────────────────────────────────────────
const expanded = ref<number | null>(null)

function toggleExpand(id: number) {
  expanded.value = expanded.value === id ? null : id
  // Reset add-book state when collapsing
  if (expanded.value !== id) {
    addBookSeriesId.value = null
  }
}

// ── Remove book from series ───────────────────────────────────────────────
const removingBookId = ref<number | null>(null)

async function removeBook(bookId: number) {
  removingBookId.value = bookId
  try {
    await $fetch(`/api/admin/books/${bookId}`, {
      method: 'PATCH',
      body: { seriesId: null, seriesOrder: 0 }
    })
    await Promise.all([refreshSeries(), refreshBooks()])
  } finally {
    removingBookId.value = null
  }
}

// ── Update book order within series ──────────────────────────────────────
const orderEdits = ref<Record<number, number>>({})
const savingOrder = ref<number | null>(null)

function initOrderEdits(s: SeriesEntry) {
  for (const b of s.books) {
    orderEdits.value[b.id] = b.order
  }
}

async function saveBookOrder(bookId: number, seriesId: number) {
  const newOrder = orderEdits.value[bookId]
  savingOrder.value = bookId
  try {
    await $fetch(`/api/admin/books/${bookId}`, {
      method: 'PATCH',
      body: { seriesId, seriesOrder: newOrder }
    })
    await Promise.all([refreshSeries(), refreshBooks()])
  } finally {
    savingOrder.value = null
  }
}

// ── Add book to series ────────────────────────────────────────────────────
const addBookSeriesId = ref<number | null>(null)
const addBookSearch = ref('')
const addBookOrder = ref(1)
const addingBook = ref(false)

const unassignedBooks = computed(() => {
  if (!allBooks.value) return []
  const q = addBookSearch.value.toLowerCase()
  return allBooks.value
    .filter(b => b.seriesId === null || b.seriesId !== addBookSeriesId.value)
    .filter(b =>
      !q ||
      b.title.toLowerCase().includes(q) ||
      (b.author ?? '').toLowerCase().includes(q)
    )
    .slice(0, 20)
})

function openAddBook(seriesId: number) {
  addBookSeriesId.value = seriesId
  addBookSearch.value = ''
  addBookOrder.value = (series.value?.find(s => s.id === seriesId)?.bookCount ?? 0) + 1
}

async function addBookToSeries(book: BookEntry) {
  if (!addBookSeriesId.value) return
  addingBook.value = true
  try {
    await $fetch(`/api/admin/books/${book.id}`, {
      method: 'PATCH',
      body: { seriesId: addBookSeriesId.value, seriesOrder: addBookOrder.value }
    })
    addBookOrder.value++
    await Promise.all([refreshSeries(), refreshBooks()])
  } finally {
    addingBook.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-default">
    <header class="border-b border-default bg-elevated px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <AppLogo class="h-6 w-auto" />
        <span class="text-sm font-semibold text-muted">Series Management</span>
      </div>
      <div class="flex items-center gap-2">
        <UButton to="/admin" variant="ghost" color="neutral" size="sm" label="Books" icon="i-lucide-arrow-left" />
        <UButton size="sm" label="New Series" icon="i-lucide-plus" @click="openCreate" />
      </div>
    </header>

    <div class="mx-auto max-w-4xl px-6 py-8">
      <div
        v-if="!series?.length"
        class="rounded-2xl border border-dashed border-default p-12 text-center text-muted text-sm"
      >
        No series yet. Create one to start grouping books.
      </div>

      <div class="flex flex-col gap-4">
        <div
          v-for="s in series"
          :key="s.id"
          class="rounded-2xl border border-default bg-elevated overflow-hidden"
        >
          <!-- Series header row -->
          <div class="flex items-center gap-4 px-5 py-4">
            <img
              v-if="s.coverUrl"
              :src="s.coverUrl"
              :alt="s.name"
              class="w-10 h-14 object-cover rounded shrink-0"
            >
            <div
              v-else
              class="w-10 h-14 bg-muted rounded shrink-0 flex items-center justify-center"
            >
              <UIcon name="i-lucide-layers" class="text-muted-foreground" />
            </div>

            <div class="flex-1 min-w-0">
              <p class="font-semibold">{{ s.name }}</p>
              <p v-if="s.description" class="text-sm text-muted truncate">{{ s.description }}</p>
              <p class="text-xs text-muted mt-0.5">{{ s.bookCount }} book{{ s.bookCount !== 1 ? 's' : '' }}</p>
            </div>

            <div class="flex items-center gap-1 shrink-0">
              <UButton
                size="xs" variant="ghost" color="neutral"
                :icon="expanded === s.id ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                :label="expanded === s.id ? 'Collapse' : 'Manage'"
                @click="toggleExpand(s.id); initOrderEdits(s)"
              />
              <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-pencil" @click="openEdit(s)" />
              <UButton
                size="xs" variant="ghost"
                :color="deleteConfirmId === s.id ? 'error' : 'neutral'"
                :icon="deleteConfirmId === s.id ? 'i-lucide-check' : 'i-lucide-trash-2'"
                :label="deleteConfirmId === s.id ? 'Confirm' : undefined"
                @click="handleDelete(s.id)"
              />
            </div>
          </div>

          <!-- Expanded: book list + add -->
          <div v-if="expanded === s.id" class="border-t border-default">
            <!-- Existing books -->
            <div v-if="s.books.length">
              <div
                v-for="book in s.books"
                :key="book.id"
                class="flex items-center gap-3 px-5 py-2.5 border-b border-default last:border-b-0 group"
              >
                <!-- Order input -->
                <div class="flex items-center gap-1 shrink-0">
                  <span class="text-xs text-muted w-4 text-right">#</span>
                  <input
                    v-model.number="orderEdits[book.id]"
                    type="number"
                    min="1"
                    class="w-12 text-xs border border-default rounded px-1.5 py-1 bg-default text-center font-mono"
                    @change="saveBookOrder(book.id, s.id)"
                  />
                </div>

                <!-- Thumbnail -->
                <img
                  v-if="book.imageUrl"
                  :src="book.imageUrl"
                  :alt="book.title"
                  class="w-6 h-8 object-cover rounded shrink-0"
                >
                <div v-else class="w-6 h-8 bg-muted rounded shrink-0" />

                <!-- Title + author -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm truncate">{{ book.title }}</p>
                  <p v-if="book.author" class="text-xs text-muted truncate">{{ book.author }}</p>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <UButton
                    size="xs" variant="ghost" color="neutral"
                    icon="i-lucide-pencil"
                    :to="`/admin/books/${book.id}`"
                    title="Edit book"
                  />
                  <UButton
                    size="xs" variant="ghost" color="error"
                    icon="i-lucide-x"
                    title="Remove from series"
                    :loading="removingBookId === book.id"
                    @click="removeBook(book.id)"
                  />
                </div>
              </div>
            </div>
            <div v-else class="px-5 py-3 text-sm text-muted">
              No books yet.
            </div>

            <!-- Add book to series -->
            <div class="border-t border-dashed border-default px-5 py-4">
              <div v-if="addBookSeriesId === s.id" class="flex flex-col gap-3">
                <p class="text-sm font-medium">Add a book to this series</p>
                <div class="flex gap-2">
                  <UInput
                    v-model="addBookSearch"
                    placeholder="Search by title or author..."
                    icon="i-lucide-search"
                    size="sm"
                    class="flex-1"
                  />
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs text-muted">#</span>
                    <input
                      v-model.number="addBookOrder"
                      type="number"
                      min="1"
                      class="w-14 text-sm border border-default rounded px-2 py-1.5 bg-default text-center font-mono"
                    />
                  </div>
                </div>

                <!-- Search results -->
                <div v-if="unassignedBooks.length" class="rounded-xl border border-default overflow-hidden">
                  <div
                    v-for="book in unassignedBooks"
                    :key="book.id"
                    class="flex items-center gap-3 px-4 py-2.5 border-b border-default last:border-0 hover:bg-muted/40 transition-colors"
                  >
                    <div class="flex-1 min-w-0">
                      <p class="text-sm truncate">{{ book.title }}</p>
                      <p class="text-xs text-muted truncate">{{ book.author ?? 'Unknown' }}</p>
                    </div>
                    <UBadge
                      v-if="book.seriesId && book.seriesId !== s.id"
                      label="In another series"
                      variant="subtle"
                      color="warning"
                      size="xs"
                    />
                    <UButton
                      size="xs"
                      icon="i-lucide-plus"
                      label="Add"
                      :loading="addingBook"
                      @click="addBookToSeries(book)"
                    />
                  </div>
                </div>
                <p v-else-if="addBookSearch" class="text-sm text-muted">No books match.</p>

                <div class="flex gap-2">
                  <UButton
                    size="sm" variant="ghost" color="neutral"
                    label="Done"
                    @click="addBookSeriesId = null"
                  />
                </div>
              </div>

              <UButton
                v-else
                size="sm"
                variant="ghost"
                color="neutral"
                icon="i-lucide-plus"
                label="Add book to this series"
                @click="openAddBook(s.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Series form slideover -->
    <USlideover v-model:open="slideoverOpen" :ui="{ width: 'max-w-md' }">
      <template #content>
        <div class="flex flex-col h-full">
          <div class="px-6 py-4 border-b border-default flex items-center justify-between">
            <h2 class="font-semibold text-lg">{{ isEditing ? 'Edit Series' : 'New Series' }}</h2>
            <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="slideoverOpen = false" />
          </div>
          <div class="flex-1 px-6 py-5 flex flex-col gap-4">
            <UFormField label="Series Name *">
              <UInput v-model="form.name" placeholder="e.g. Harry Potter" />
            </UFormField>
            <UFormField label="Description">
              <UTextarea v-model="form.description" placeholder="Optional short description" :rows="3" />
            </UFormField>
            <UAlert v-if="saveError" color="error" variant="subtle" :description="saveError" icon="i-lucide-alert-circle" />
          </div>
          <div class="px-6 py-4 border-t border-default flex justify-end gap-2">
            <UButton variant="outline" color="neutral" label="Cancel" @click="slideoverOpen = false" />
            <UButton :loading="saving" :label="isEditing ? 'Save' : 'Create'" @click="saveSeries" />
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>
