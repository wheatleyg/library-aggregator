<script setup lang="ts">
const props = defineProps<{ modelValue: string | null }>()
const emit = defineEmits<{ 'update:modelValue': [url: string | null] }>()

const uploading = ref(false)
const error = ref('')

async function handleFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  error.value = ''
  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('file', file)
    const result = await $fetch<{ url: string }>('/api/admin/upload', {
      method: 'POST',
      body: formData
    })
    emit('update:modelValue', result.url)
  } catch (err: any) {
    error.value = err?.data?.message ?? 'Upload failed'
  } finally {
    uploading.value = false
    input.value = ''
  }
}

function clearImage() {
  emit('update:modelValue', null)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Preview -->
    <div v-if="modelValue" class="relative w-36 rounded-xl overflow-hidden shadow-md aspect-[2/3]">
      <img :src="modelValue" alt="Cover preview" class="w-full h-full object-cover" />
      <button
        type="button"
        class="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm leading-none"
        title="Remove image"
        @click="clearImage"
      >
        ×
      </button>
    </div>
    <div
      v-else
      class="w-36 aspect-[2/3] rounded-xl bg-muted flex items-center justify-center"
    >
      <UIcon name="i-lucide-image" class="text-3xl text-muted-foreground" />
    </div>

    <!-- Upload trigger -->
    <label class="cursor-pointer inline-flex">
      <UButton
        as="span"
        size="sm"
        variant="outline"
        color="neutral"
        :loading="uploading"
        icon="i-lucide-upload"
        :label="modelValue ? 'Replace' : 'Upload image'"
      />
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        class="hidden"
        :disabled="uploading"
        @change="handleFile"
      />
    </label>

    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
    <p v-if="modelValue" class="text-xs text-muted truncate max-w-[160px]">{{ modelValue }}</p>
  </div>
</template>
