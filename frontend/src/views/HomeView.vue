<template>
  <div>
    <h1>Home</h1>
    <p>Your app is alive 🚀</p>
    <button @click="fetchData">Click me!</button>
    <p v-if="data">{{ data }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: null,
    };
  },
  methods: {
    async fetchData() {
      const response = await fetch("http://localhost:3000");
      const text = await response.json();

      this.data = text.secretMessage;
      console.log(this.data)
    }
  }
}
</script>