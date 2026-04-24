<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const GENRES = ['Fiction', 'Non-Fiction', 'Fantasy', 'Biography', 'Science Fiction', 'Romance', 'Horror', 'Historical']
const SCORE_MAX = 30

const route = useRoute()
const id = Number(route.params.id)

// ── Data ───────────────────────────────────────────────────────────────────
type AdminBook = {
  id: number; title: string; author: string | null; callNumber: string
  isbn: string | null; lccn: string | null; imageUrl: string | null
  genre: string | null; description: string | null
  popularityScore: number; seriesId: number | null; seriesOrder: number
  seriesName: string | null; viewCount: number; isEnriched: boolean
}

const { data: bk, status, refresh: refreshBook } = await useAsyncData(
  `admin-book-${id}`,
  () => $fetch<AdminBook>(`/api/admin/books/${id}`)
)

const { data: seriesList, refresh: refreshSeries } = await useAsyncData(
  'admin-series-for-edit',
  () => $fetch<{ id: number; name: string }[]>('/api/admin/series')
)

// ── Form ───────────────────────────────────────────────────────────────────
const form = reactive({
  title: '',
  author: '',
  callNumber: '',
  isbn: '',
  lccn: '',
  image: null as string | null,
  genre: '',
  description: '',
  seriesId: null as number | null,
  seriesOrder: 0,
  popularityScore: 0
})

watch(bk, (val) => {
  if (!val) return
  form.title = val.title
  form.author = val.author ?? ''
  form.callNumber = val.callNumber
  form.isbn = val.isbn ?? ''
  form.lccn = val.lccn ?? ''
  form.image = val.imageUrl
  form.genre = val.genre ?? ''
  form.description = val.description ?? ''
  form.seriesId = val.seriesId ?? null
  form.seriesOrder = val.seriesOrder
  form.popularityScore = val.popularityScore
}, { immediate: true })

// ── Conflict check ─────────────────────────────────────────────────────────
const conflicts = ref<{ field: string; message: string }[]>([])

async function checkConflicts() {
  const q = new URLSearchParams({ excludeId: String(id) })
  if (form.title) q.set('title', form.title)
  if (form.callNumber) q.set('callNumber', form.callNumber)
  if (form.isbn) q.set('isbn', form.isbn)
  const result = await $fetch<{ conflicts: { field: string; message: string }[] }>(
    `/api/admin/books/check?${q}`
  ).catch(() => ({ conflicts: [] }))
  conflicts.value = result.conflicts
}

// ── Save (metadata only — score has its own save) ─────────────────────────
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)

async function save() {
  if (!form.title.trim()) { saveError.value = 'Title is required.'; return }
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  try {
    await $fetch(`/api/admin/books/${id}`, {
      method: 'PATCH',
      body: {
        title: form.title,
        author: form.author || null,
        callNumber: form.callNumber,
        isbn: form.isbn || null,
        lccn: form.lccn || null,
        image: form.image || null,
        genre: form.genre || null,
        description: form.description || null,
        seriesId: form.seriesId,
        seriesOrder: Number(form.seriesOrder) || 0
        // popularityScore intentionally excluded — use "Set score" button
      }
    })
    saveSuccess.value = true
    await refreshBook()
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch {
    saveError.value = 'Could not save. Check for duplicate title/call number.'
  } finally {
    saving.value = false
  }
}

// ── Score save (separate from metadata save) ───────────────────────────────
const scoreSaving = ref(false)
const scoreSuccess = ref(false)

async function saveScore() {
  scoreSaving.value = true
  scoreSuccess.value = false
  try {
    await $fetch(`/api/admin/books/${id}`, {
      method: 'PATCH',
      body: { popularityScore: Number(form.popularityScore) }
    })
    scoreSuccess.value = true
    await refreshBook()
    setTimeout(() => { scoreSuccess.value = false }, 2000)
  } finally {
    scoreSaving.value = false
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────
const deleteConfirm = ref(false)
let deleteTimer: ReturnType<typeof setTimeout>

async function handleDelete() {
  if (!deleteConfirm.value) {
    deleteConfirm.value = true
    clearTimeout(deleteTimer)
    deleteTimer = setTimeout(() => { deleteConfirm.value = false }, 3000)
    return
  }
  await $fetch(`/api/admin/books/${id}`, { method: 'DELETE' })
  await navigateTo('/admin')
}

// ── AI Suggest ─────────────────────────────────────────────────────────────
const aiLoading = ref(false)
const aiError = ref('')
const aiSuggestion = ref<{
  description: string
  genre: string
  seriesSuggestion: { id: number | null; name: string } | null
} | null>(null)

async function runAISuggest() {
  aiLoading.value = true
  aiError.value = ''
  aiSuggestion.value = null
  try {
    aiSuggestion.value = await $fetch(`/api/admin/ai-suggest/${id}`, { method: 'POST' })
  } catch (e: any) {
    aiError.value = e?.data?.message ?? 'AI suggestion failed'
  } finally {
    aiLoading.value = false
  }
}

function applyAISuggestion() {
  if (!aiSuggestion.value) return
  form.description = aiSuggestion.value.description
  form.genre = aiSuggestion.value.genre
  const s = aiSuggestion.value.seriesSuggestion
  if (s?.id != null) form.seriesId = s.id
  aiSuggestion.value = null
}

const creatingNewSeries = ref(false)

async function createAndApplySeries(name: string) {
  creatingNewSeries.value = true
  try {
    const newSeries = await $fetch<{ id: number; name: string }>('/api/admin/series', {
      method: 'POST',
      body: { name }
    })
    await refreshSeries()
    form.seriesId = newSeries.id
    if (aiSuggestion.value) {
      form.description = aiSuggestion.value.description
      form.genre = aiSuggestion.value.genre
      aiSuggestion.value = null
    }
  } catch {
    aiError.value = 'Could not create series'
  } finally {
    creatingNewSeries.value = false
  }
}

// ── Score bar ──────────────────────────────────────────────────────────────
const scorePercent = computed(() =>
  Math.min(100, (form.popularityScore / SCORE_MAX) * 100)
)
</script>

<template>
  <div class="min-h-screen bg-default">
    <!-- Admin header bar -->
    <header class="border-b border-default bg-elevated/95 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div class="flex items-center gap-2 text-sm text-muted">
        <UButton
          to="/admin"
          variant="ghost"
          color="neutral"
          icon="i-lucide-arrow-left"
          label="Books"
          size="sm"
        />
        <span>/</span>
        <span class="truncate max-w-[200px]">{{ bk?.title ?? 'Edit Book' }}</span>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          :to="`/books/${id}`"
          target="_blank"
          variant="ghost"
          color="neutral"
          size="sm"
          label="Public page"
          icon="i-lucide-external-link"
        />
        <UButton
          size="sm"
          variant="outline"
          :color="deleteConfirm ? 'error' : 'neutral'"
          :icon="deleteConfirm ? 'i-lucide-check' : 'i-lucide-trash-2'"
          :label="deleteConfirm ? 'Confirm delete' : 'Delete'"
          @click="handleDelete"
        />
        <UButton
          size="sm"
          icon="i-lucide-save"
          :loading="saving"
          :color="saveSuccess ? 'success' : 'primary'"
          :label="saveSuccess ? 'Saved!' : 'Save changes'"
          @click="save"
        />
      </div>
    </header>

    <!-- Loading skeleton -->
    <template v-if="status === 'pending'">
      <div class="mx-auto max-w-4xl px-6 py-10 animate-pulse flex gap-10">
        <div class="w-36 aspect-[2/3] rounded-xl bg-muted shrink-0" />
        <div class="flex-1 flex flex-col gap-3">
          <div class="h-8 bg-muted rounded w-2/3" />
          <div class="h-5 bg-muted rounded w-1/3" />
          <div class="h-4 bg-muted rounded w-full mt-4" />
          <div class="h-4 bg-muted rounded w-full" />
        </div>
      </div>
    </template>

    <!-- Not found -->
    <template v-else-if="!bk">
      <div class="mx-auto max-w-4xl px-6 py-16">
        <UEmpty icon="i-lucide-book-x" label="Book not found">
          <template #actions>
            <UButton to="/admin" label="Back to admin" />
          </template>
        </UEmpty>
      </div>
    </template>

    <!-- Edit form -->
    <template v-else>
      <div class="mx-auto max-w-4xl px-6 py-8">
        <!-- Errors / conflicts -->
        <UAlert
          v-if="saveError"
          color="error"
          variant="subtle"
          :description="saveError"
          icon="i-lucide-alert-circle"
          class="mb-4"
        />
        <div v-if="conflicts.length" class="mb-4 flex flex-col gap-2">
          <UAlert
            v-for="c in conflicts"
            :key="c.field"
            color="warning"
            variant="subtle"
            :description="c.message"
            icon="i-lucide-triangle-alert"
          />
        </div>

        <div class="flex flex-col sm:flex-row gap-8 rounded-2xl border border-default bg-elevated p-5 shadow-sm">
          <!-- Left: cover -->
          <div class="shrink-0 flex flex-col gap-4 items-start">
            <AdminImageUpload v-model="form.image" />
            <div class="text-xs text-muted space-y-0.5 rounded-xl border border-default bg-default px-3 py-2">
              <p><span class="font-medium">ID:</span> {{ bk.id }}</p>
              <p><span class="font-medium">Views:</span> {{ bk.viewCount }}</p>
            </div>
          </div>

          <!-- Right: fields -->
          <div class="flex-1 min-w-0 flex flex-col gap-4">
            <UFormField label="Title *">
              <UInput
                v-model="form.title"
                placeholder="Book title"
                size="lg"
                @blur="checkConflicts"
              />
            </UFormField>

            <UFormField label="Author">
              <UInput v-model="form.author" placeholder="First Last" />
            </UFormField>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <UFormField label="Call Number">
                <UInput
                  v-model="form.callNumber"
                  placeholder="e.g. 813.54 ROW"
                  @blur="checkConflicts"
                />
              </UFormField>
              <UFormField label="Genre">
                <USelect v-model="form.genre" :items="GENRES" placeholder="Select genre" />
              </UFormField>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <UFormField label="ISBN">
                <UInput
                  v-model="form.isbn"
                  placeholder="978-..."
                  @blur="checkConflicts"
                />
              </UFormField>
              <UFormField label="LCCN">
                <UInput v-model="form.lccn" placeholder="Optional" />
              </UFormField>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <UFormField label="Series">
                <select
                  :value="form.seriesId ?? ''"
                  class="w-full rounded-md border border-[var(--ui-border)] bg-[var(--ui-bg)] px-3 py-2 text-sm text-[var(--ui-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ui-primary)]"
                  @change="form.seriesId = ($event.target as HTMLSelectElement).value === '' ? null : Number(($event.target as HTMLSelectElement).value)"
                >
                  <option value="">None</option>
                  <option
                    v-for="s in seriesList"
                    :key="s.id"
                    :value="s.id"
                  >
                    {{ s.name }}
                  </option>
                </select>
              </UFormField>
              <UFormField label="Order in Series">
                <UInput
                  v-model="form.seriesOrder"
                  type="number"
                  min="0"
                  :disabled="!form.seriesId"
                />
              </UFormField>
            </div>

            <UFormField label="Description">
              <UTextarea
                v-model="form.description"
                :rows="4"
                placeholder="Leave blank to let AI generate on first public view"
              />
            </UFormField>

            <!-- AI button -->
            <div class="flex items-center gap-3 flex-wrap">
              <UButton
                variant="outline"
                color="neutral"
                icon="i-lucide-sparkles"
                label="AI Suggest"
                :loading="aiLoading"
                @click="runAISuggest"
              />
              <span class="text-xs text-muted">Suggests description, genre & series using AI</span>
            </div>

            <!-- AI suggestion panel -->
            <div
              v-if="aiSuggestion"
              class="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 flex flex-col gap-3"
            >
              <div class="flex items-center justify-between">
                <p class="text-sm font-semibold flex items-center gap-1.5">
                  <UIcon name="i-lucide-sparkles" class="text-primary" />
                  AI Suggestion
                </p>
                <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-x" @click="aiSuggestion = null" />
              </div>

              <div class="text-sm space-y-2">
                <p>
                  <span class="text-muted font-medium">Genre: </span>
                  <UBadge :label="aiSuggestion.genre" variant="subtle" color="primary" />
                </p>
                <p>
                  <span class="text-muted font-medium">Description: </span>
                  {{ aiSuggestion.description }}
                </p>
                <div v-if="aiSuggestion.seriesSuggestion">
                  <span class="text-muted font-medium">Series: </span>
                  <template v-if="aiSuggestion.seriesSuggestion.id !== null">
                    <UBadge :label="aiSuggestion.seriesSuggestion.name" variant="subtle" color="neutral" class="mr-1" />
                    <span class="text-xs text-muted">existing — will be applied with "Apply all"</span>
                  </template>
                  <template v-else>
                    <UBadge :label="aiSuggestion.seriesSuggestion.name" variant="subtle" color="warning" class="mr-2" />
                    <span class="text-xs text-muted mr-2">new series</span>
                    <UButton
                      size="xs"
                      variant="outline"
                      color="neutral"
                      label="Create & apply"
                      :loading="creatingNewSeries"
                      @click="createAndApplySeries(aiSuggestion!.seriesSuggestion!.name)"
                    />
                  </template>
                </div>
                <p v-else class="text-xs text-muted">No series suggested (standalone book)</p>
              </div>

              <div class="flex gap-2 pt-1">
                <UButton size="sm" label="Apply all" icon="i-lucide-check" @click="applyAISuggestion" />
                <UButton size="sm" variant="ghost" color="neutral" label="Dismiss" @click="aiSuggestion = null" />
              </div>
            </div>

            <p v-if="aiError" class="text-sm text-red-500">{{ aiError }}</p>

            <USeparator />

            <!-- Popularity score (separate save to prevent accidental resets) -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-medium">Popularity Score</p>
                <span class="font-mono text-sm tabular-nums">{{ Number(form.popularityScore).toFixed(3) }}</span>
              </div>
              <!-- Bar -->
              <div class="w-full h-2.5 rounded-full bg-muted overflow-hidden mb-3">
                <div
                  class="h-full rounded-full bg-primary transition-all duration-150"
                  :style="{ width: scorePercent + '%' }"
                />
              </div>
              <!-- Slider -->
              <input
                v-model.number="form.popularityScore"
                type="range"
                min="0"
                :max="SCORE_MAX"
                step="0.001"
                class="w-full accent-primary cursor-pointer"
              />
              <div class="flex items-center justify-between mt-2">
                <p class="text-xs text-muted">
                  Auto-computed from view recency. Adjust to manually boost or reset ranking.
                </p>
                <UButton
                  size="xs"
                  variant="outline"
                  :color="scoreSuccess ? 'success' : 'neutral'"
                  :label="scoreSuccess ? 'Saved!' : 'Set score'"
                  :loading="scoreSaving"
                  @click="saveScore"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom action bar -->
        <div class="mt-10 pt-6 border-t border-default flex justify-end gap-3">
          <UButton to="/admin" variant="outline" color="neutral" label="Cancel" />
          <UButton
            icon="i-lucide-save"
            :loading="saving"
            :color="saveSuccess ? 'success' : 'primary'"
            :label="saveSuccess ? 'Saved!' : 'Save changes'"
            @click="save"
          />
        </div>
      </div>
    </template>
  </div>
</template>
