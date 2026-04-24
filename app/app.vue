<script setup>
useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: { lang: 'en' }
})

useSeoMeta({
  title: 'FC Library',
  description: 'Franklin Central High School Library — search the catalog, discover popular books, and more.',
  ogTitle: 'FC Library',
  ogDescription: 'Franklin Central High School Library — search the catalog, discover popular books, and more.'
})
</script>

<template>
  <UApp>
    <UHeader class="app-shell-header">
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2">
          <AppLogo class="w-auto h-6 shrink-0" />
          <span class="font-bold text-sm hidden sm:block">FC Library</span>
        </NuxtLink>
        <nav class="hidden lg:flex items-center gap-1 ml-4">
          <UButton
            to="/"
            variant="ghost"
            color="neutral"
            size="sm"
            label="Home"
          />
          <UButton
            to="/catalog"
            variant="ghost"
            color="neutral"
            size="sm"
            label="Catalog"
          />
          <UButton
            to="/series"
            variant="ghost"
            color="neutral"
            size="sm"
            label="Series"
          />
          <UButton
            to="/events"
            variant="ghost"
            color="neutral"
            size="sm"
            label="Events"
          />
          <UButton
            to="/contact"
            variant="ghost"
            color="neutral"
            size="sm"
            label="Contact"
          />
        </nav>
      </template>

      <template #right>
        <div class="hidden md:flex lg:hidden items-center gap-1">
          <UButton to="/catalog" variant="ghost" color="neutral" size="sm" label="Catalog" />
          <UButton to="/series" variant="ghost" color="neutral" size="sm" label="Series" />
        </div>
        <UColorModeButton />
        <UButton
          to="/admin"
          icon="i-lucide-lock"
          variant="ghost"
          color="neutral"
          size="sm"
          aria-label="Admin"
          class="opacity-30 hover:opacity-100 transition-opacity"
        />
      </template>
    </UHeader>

    <UMain class="app-shell-main">
      <NuxtPage />
    </UMain>

    <UFooter class="app-shell-footer">
      <template #left>
        <p class="text-sm text-muted">
          Franklin Central High School Library &middot; <a href="mailto:gwheatley@ftstudent.org" class="hover:text-primary transition-colors">Contact Us</a>
        </p>
      </template>
      <template #right>
        <UColorModeButton size="sm" />
      </template>
    </UFooter>
  </UApp>
</template>
