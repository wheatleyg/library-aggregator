<script setup lang="ts">
// Redirect legacy /BookSearcher URLs to /catalog, preserving the query
const route = useRoute()
await navigateTo(
  { path: '/catalog', query: route.query },
  { replace: true, redirectCode: 301 }
)
</script>

<template>
  <div />
</template>
