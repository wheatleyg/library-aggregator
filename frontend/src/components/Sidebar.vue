<script setup>
</script>
<template>
  <v-navigation-drawer
  expand-on-hover
  permanent
  rail>
    <v-list>
      <v-list-item
          title="User "> </v-list-item>


    </v-list>

    <v-divider></v-divider>

    <v-list nav dense>
      <v-list-item prepend-icon="mdi-map-marker" title="Location" value="location"></v-list-item>
      <v-list-item prepend-icon="mdi-information" title="About" value="about"></v-list-item>
      <v-list-item prepend-icon = "mdi-help-circle" title="Help" value="help"></v-list-item>
    </v-list>

  </v-navigation-drawer>
</template>