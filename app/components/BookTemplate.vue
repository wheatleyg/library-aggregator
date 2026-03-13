<template>
  <div>
    <NuxtImg
      :src="image"
      alt="f"
      class="rounded-3xl w-full"
      width="350"
      height="400"
      fit="cover"
    />
    <p class="mt-1 text-sm text-center">
      {{ label }} | {{ author }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  image: String,
  label: String,
  author: String
})
</script>

<style scoped>
div{
  border-color: red;
}
img{
  border-color: white;
  border-width: 4px;
  border-style: solid;
  width: 250px;
  height: 300px;
}
</style>
