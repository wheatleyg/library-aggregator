<script setup>
import HelloWorld from './components/HelloWorld.vue'
import login from './components/login.vue'
import TheWelcome from './components/TheWelcome.vue'

</script>

<template>
  <v-app>
    <login />


    <!-- Main Content Area -->
    <v-main>
<router-view />
    </v-main>
  </v-app>
</template>
<style scoped>
img{
  width:400px;
  height:300px;
  margin:5px;
}
</style>

