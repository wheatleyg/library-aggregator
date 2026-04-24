<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

// ── Data ──────────────────────────────────────────────────────────────────
const { data: stats, refresh: refreshStats } = await useAsyncData('admin-stats', () => $fetch<{
  totalBooks: number; totalViews: number; unenriched: number
}>('/api/admin/stats'))

const { data: books, refresh: refreshBooks } = await useAsyncData('admin-books', () => $fetch<{
  id: number; title: string; author: string | null; callNumber: string
  isbn: string | null; lccn: string | null; imageUrl: string | null
  genre: string | null; description: string | null
  seriesId: number | null; seriesOrder: number; seriesName: string | null
  isEnriched: boolean; viewCount: number; popularityScore: number
}[]>('/api/admin/books'))

// ── Search / filter ───────────────────────────────────────────────────────
const search = ref('')
const filteredBooks = computed(() => {
  if (!books.value) return []
  const q = search.value.toLowerCase()
  return books.value.filter(b =>
    b.title.toLowerCase().includes(q) ||
    (b.author ?? '').toLowerCase().includes(q)
  )
})

// ── Book form (quick create) ───────────────────────────────────────────────
const slideoverOpen = ref(false)
const saving = ref(false)
const saveError = ref('')

const emptyForm = () => ({ title: '', author: '', callNumber: '' })
const form = reactive(emptyForm())

function openCreate() {
  Object.assign(form, emptyForm())
  saveError.value = ''
  slideoverOpen.value = true
}

function openEdit(book: typeof books.value[number]) {
  navigateTo(`/admin/books/${book.id}`)
}

async function saveBook() {
  if (!form.title.trim()) { saveError.value = 'Title is required.'; return }
  saving.value = true
  saveError.value = ''
  try {
    const newBook = await $fetch<{ id: number }>('/api/admin/books', { method: 'POST', body: form })
    slideoverOpen.value = false
    await Promise.all([refreshBooks(), refreshStats()])
    // Navigate to detail page for full editing
    await navigateTo(`/admin/books/${newBook.id}`)
  } catch {
    saveError.value = 'Could not create. Make sure the title is unique.'
  } finally {
    saving.value = false
  }
}

// ── Delete ────────────────────────────────────────────────────────────────
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
  await $fetch(`/api/admin/books/${id}`, { method: 'DELETE' })
  await Promise.all([refreshBooks(), refreshStats()])
}

// ── Enrichment reset ──────────────────────────────────────────────────────
const resetting = ref<number | null>(null)
async function resetEnrichment(id: number) {
  resetting.value = id
  try {
    await $fetch(`/api/admin/reset/${id}`, { method: 'POST' })
    await refreshBooks()
  } finally {
    resetting.value = null
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────
async function logout() {
  await $fetch('/api/admin/logout')
  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="min-h-screen bg-default">
    <!-- Admin header -->
    <header class="border-b border-default bg-elevated/95 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div class="flex items-center gap-3">
        <AppLogo class="h-6 w-auto" />
        <span class="text-sm font-semibold text-muted">Admin Dashboard</span>
      </div>
      <div class="flex items-center gap-2">
        <UButton to="/" variant="ghost" color="neutral" size="sm" label="View site" icon="i-lucide-external-link" />
        <UButton variant="outline" color="neutral" size="sm" label="Log out" icon="i-lucide-log-out" @click="logout" />
      </div>
    </header>

    <div class="mx-auto max-w-6xl px-6 py-8">
      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div class="rounded-2xl border border-default bg-elevated p-5 shadow-sm">
          <p class="text-sm text-muted mb-1 flex items-center gap-1"><UIcon name="i-lucide-book-open" /> Total Books</p>
          <p class="text-3xl font-bold">{{ stats?.totalBooks ?? '—' }}</p>
        </div>
        <div class="rounded-2xl border border-default bg-elevated p-5 shadow-sm">
          <p class="text-sm text-muted mb-1 flex items-center gap-1"><UIcon name="i-lucide-eye" /> Total Views</p>
          <p class="text-3xl font-bold">{{ stats?.totalViews ?? '—' }}</p>
        </div>
        <div class="rounded-2xl border border-default bg-elevated p-5 shadow-sm">
          <p class="text-sm text-muted mb-1 flex items-center gap-1"><UIcon name="i-lucide-sparkles" /> Needs Enrichment</p>
          <p class="text-3xl font-bold" :class="stats?.unenriched ? 'text-orange-500' : ''">
            {{ stats?.unenriched ?? '—' }}
          </p>
        </div>
      </div>

      <!-- Table header -->
      <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 class="text-lg font-semibold">Books</h2>
        <div class="flex items-center gap-2">
          <UInput v-model="search" placeholder="Filter books..." icon="i-lucide-search" size="sm" class="w-56" />
          <UButton to="/admin/series" variant="outline" color="neutral" size="sm" label="Series" icon="i-lucide-layers" />
          <UButton size="sm" label="Add Book" icon="i-lucide-plus" @click="openCreate" />
        </div>
      </div>

      <!-- Book table -->
      <div class="rounded-2xl border border-default overflow-x-auto shadow-sm bg-default">
        <table class="w-full text-sm">
          <thead class="bg-elevated border-b border-default sticky top-[69px] z-20">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-muted">Book</th>
              <th class="text-left px-4 py-3 font-medium text-muted hidden lg:table-cell">Series</th>
              <th class="text-left px-4 py-3 font-medium text-muted hidden sm:table-cell">Genre</th>
              <th class="text-right px-4 py-3 font-medium text-muted hidden md:table-cell">Score</th>
              <th class="text-right px-4 py-3 font-medium text-muted">Views</th>
              <th class="text-right px-4 py-3 font-medium text-muted">AI</th>
              <th class="px-4 py-3 text-right font-medium text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="book in filteredBooks"
              :key="book.id"
              class="border-b border-default last:border-0 hover:bg-elevated/60 transition-colors"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img
                    v-if="book.imageUrl"
                    :src="book.imageUrl"
                    :alt="book.title"
                    class="w-8 h-10 object-cover rounded shrink-0"
                  >
                  <div v-else class="w-8 h-10 bg-muted rounded shrink-0 flex items-center justify-center">
                    <UIcon name="i-lucide-book" class="text-xs text-muted-foreground" />
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium truncate max-w-[240px]">{{ book.title }}</p>
                    <p class="text-xs text-muted truncate">{{ book.author ?? 'Unknown' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 hidden lg:table-cell">
                <span v-if="book.seriesName" class="text-xs text-muted">
                  {{ book.seriesName }} #{{ book.seriesOrder }}
                </span>
                <span v-else class="text-xs text-muted">—</span>
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <UBadge v-if="book.genre" :label="book.genre" variant="subtle" color="primary" size="sm" />
                <span v-else class="text-xs text-muted">—</span>
              </td>
              <td class="px-4 py-3 text-right font-mono text-xs text-muted hidden md:table-cell">{{ book.popularityScore }}</td>
              <td class="px-4 py-3 text-right font-medium">{{ book.viewCount }}</td>
              <td class="px-4 py-3 text-right">
                <UIcon
                  :name="book.isEnriched ? 'i-lucide-check-circle' : 'i-lucide-circle-dashed'"
                  :class="book.isEnriched ? 'text-green-500' : 'text-muted'"
                />
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <UButton
                    v-if="book.isEnriched"
                    size="xs" variant="ghost" color="neutral"
                    icon="i-lucide-rotate-ccw"
                    :loading="resetting === book.id"
                    title="Reset AI enrichment"
                    @click="resetEnrichment(book.id)"
                  />
                    <UButton
                    size="xs" variant="ghost" color="neutral"
                    icon="i-lucide-pencil"
                    title="Edit book"
                      class="hover:bg-primary/10"
                    @click="openEdit(book)"
                  />
                    <UButton
                    size="xs" variant="ghost"
                    :color="deleteConfirmId === book.id ? 'error' : 'neutral'"
                    :icon="deleteConfirmId === book.id ? 'i-lucide-check' : 'i-lucide-trash-2'"
                    :label="deleteConfirmId === book.id ? 'Confirm' : undefined"
                    :title="deleteConfirmId === book.id ? 'Click again to delete' : 'Delete book'"
                      class="hover:bg-error/10"
                    @click="handleDelete(book.id)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredBooks.length === 0" class="py-12 text-center text-muted text-sm">
          No books match your filter.
        </div>
      </div>
    </div>

    <!-- Quick add book slideover (minimal — edit page handles full details) -->
    <USlideover v-model:open="slideoverOpen" :ui="{ width: 'max-w-md' }">
      <template #content>
        <div class="flex flex-col h-full">
          <div class="px-6 py-4 border-b border-default flex items-center justify-between">
            <h2 class="font-semibold text-lg">Add Book</h2>
            <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="slideoverOpen = false" />
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
            <p class="text-sm text-muted">Enter the basics — you'll be taken to the full edit page to add images, descriptions, series, and more.</p>
            <UFormField label="Title *">
              <UInput v-model="form.title" placeholder="Book title" />
            </UFormField>
            <UFormField label="Author">
              <UInput v-model="form.author" placeholder="First Last" />
            </UFormField>
            <UFormField label="Call Number">
              <UInput v-model="form.callNumber" placeholder="e.g. 813.54 ROW" />
            </UFormField>
            <UAlert v-if="saveError" color="error" variant="subtle" :description="saveError" icon="i-lucide-alert-circle" />
          </div>

          <div class="px-6 py-4 border-t border-default flex justify-end gap-2">
            <UButton variant="outline" color="neutral" label="Cancel" @click="slideoverOpen = false" />
            <UButton :loading="saving" label="Add & continue editing" icon="i-lucide-arrow-right" @click="saveBook" />
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>
