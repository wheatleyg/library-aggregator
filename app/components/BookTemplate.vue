<template>
  <div>
    <img
      :src="image"
      alt="f"
      class="rounded-3xl w-full"
    >
    <p class="mt-1 text-sm text-center">
      {{ label }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  image: String,
  label: String
})
</script>

<style>
div{
  border-color: red;
}
img{
  border-color: black;
  border-width: 4px;
  border-style: dotted;
}
</style>
