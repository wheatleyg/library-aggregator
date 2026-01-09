<script setup>
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
</script>

<template>
  <v-app>
    <!-- Header Bar -->
    <v-app-bar color="white" elevation="1" height="90">
      <!-- Logo with standard margin -->
      <div style="background-color: #92CBFF; height: 50px; z-index: 2;"  class="rounded-pill align-center d-flex ml-2 mr-n10 " >
      <v-img src="/fchs_logo_cirlce.png" max-height="80" width="80" eager contain class="mr-4 ml-0" />
      </div>
      <!--
        1. 'mx-4' applies both left and right margin to the blue bar so it's symmetrical.
        2. 'px-2' replaces the default internal padding to keep content inside the blue bar.
      -->
      <v-toolbar color="#92CBFF" height="50" flat class="mr-4 ml-0 px-2 rounded-pill align-center flex-grow-1" style="max-width: calc(100vw - 90px);">

        <!-- Navigation Buttons with 'px-1' to tighten space between them -->
        <v-btn variant="text" class="px-1 mx-2 ml-8" min-width="auto">Location</v-btn>
        <v-btn variant="text" class="px-1 mx-2" min-width="auto">About</v-btn>
        <v-btn variant="text" class="px-1 mx-2" min-width="auto">Help</v-btn>

        <v-spacer></v-spacer>

        <div class="d-flex align-center">
          <!-- Admin button pulled closer to input -->
          <v-btn variant="text" class="px-1 mx-8" min-width="auto">Admin</v-btn>

          <!--
            1. Fixed 'width' (not max-width) prevents scaling issues.
            2. 'mr-1' ensures a tiny gap so the search bar doesn't touch the very edge.
          -->
          <v-text-field
              density="compact"
              variant="solo"
              label="Your search here. . .  "
              single-line
              hide-details
              class="mr-10 ml-8 text-body-2 flex-grow-1"
              style="width: 220px;"

          ></v-text-field>
        </div>
      </v-toolbar>
    </v-app-bar>



    <!-- Main Content Area -->
    <v-main>
      <v-container>
        <p>Sample text</p>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>

</style>
