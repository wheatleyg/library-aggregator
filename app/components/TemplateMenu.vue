<template>
  <header class="  px-4 py-2 flex items-center">
    <!-- Logo / Title -->
    <h1 class="text-lg font-bold mr-6">FCHS Library</h1>

    <!-- Navigation buttons -->
    <nav class="flex gap-3">
      <UButton
        label="Home"
        variant="subtle"
        size="sm"
        :to="'/'"
      />
      <UButton
        label="Catalog"
        variant="subtle"
        size="sm"
        :to="'/catalog'"
      />
      <UButton
        label="Events"
        variant="subtle"
        size="sm"
        :to="'/events'"
      />
      <UButton
        label="Contact"
        variant="subtle"
        size="sm"
        :to="'/contact'"
      />
    </nav>
  </header>
</template>
