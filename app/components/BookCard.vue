<script setup>
defineProps({
  id: Number,
  image: String,
  title: String,
  author: String
})
</script>

<template>
  <NuxtLink
    :to="`/books/${id}`"
    class="group flex flex-col items-center gap-2 rounded-2xl p-2 hover:bg-elevated/70 transition-colors"
  >
    <div class="relative w-full overflow-hidden rounded-2xl border border-default shadow-sm group-hover:shadow-xl group-hover:-translate-y-0.5 transition-all duration-200">
      <NuxtImg
        :src="image"
        :alt="title"
        class="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
        placeholder
        fit="cover"
      />
    </div>
    <div class="w-full text-center">
      <p class="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors min-h-10">
        {{ title }}
      </p>
      <p class="text-xs text-muted mt-0.5 truncate">
        {{ author }}
      </p>
    </div>
  </NuxtLink>
</template>
