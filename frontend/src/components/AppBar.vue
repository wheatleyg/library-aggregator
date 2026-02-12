<script setup>
</script>
<template>
  <v-app-bar app :elevation="5" class="pr-4" image="/geometric-blue.jpg" color="dark-">

    <template #prepend>
      <v-img src="/fchs_logo_cirlce.png" contain width="50" height="50"></v-img>

    </template>
    <v-toolbar-title style="min-width:200px">
      Franklin Central High School
    </v-toolbar-title>
    <v-spacer />
    <div style="width:400px">
      <v-text-field
          density="compact"
          label="Search"
          single-line
          style="width: 400px;"
          hide-details="auto"
          class="mr-4"
          variant="solo"
      ></v-text-field>
    </div>





    </v-app-bar>
</template>