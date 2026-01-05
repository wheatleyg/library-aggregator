<script setup>
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/fchs_logo_cirlce.png"/>

    <div class="wrapper">
      <ul class="nav-list">
      <li><h1>Location</h1></li>
        <li><h1>About</h1></li>
        <li><h1>Help</h1></li>

      </ul>
      <h2 style="margin-left: 40px; font-style: italic; font-size: 16px"> Admin</h2>
      <input style="margin-left:65px; height:65%; font-size: 18px" type="text" placeholder="Search. . . ">

    </div>
  </header>


  <main>


          </main>
</template>

<style scoped>
header {
  line-height: 1.5;
  background-color: white;
  width: 100%;
  height: 90px;
  display: flex;
  align-items: center;
}
.wrapper {
  background-color: #92CBFF;
  width: 100%;
  margin-left:-20px;
  padding-left: 50px;
  height: 50px;
  display: flex;
  align-items: center;


}
.header-content {
  margin-left: 20px;
}
.nav-list {
  list-style: none;
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
}

.nav-list li {
  display: flex;
  align-items: center;
  margin: 0 20px 0 0;

}

.nav-list li::after {
  content: "";
  width: 18px;
  height: 18px;
  background-image: url("./assets/header_icon.png");
  background-size: contain;
  background-repeat: no-repeat;
  margin-right: 2px;
  margin-left: 2px;
  margin-top: 8px;

}


.logo {
  float: left;
  height: 100%;
  position: relative;
  z-index: 1;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);

  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
