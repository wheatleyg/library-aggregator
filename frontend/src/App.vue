<script setup>
import Sidebar from "@/components/Sidebar.vue";
import AppBar from "@/components/AppBar.vue";
</script>

<template>
  <v-app>
    <!-- later: sidebar, footer, etc -->
  <AppBar />
  <Sidebar />

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
