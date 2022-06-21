<template>
  <nav class="navbar navbar-dark bg-brand mb-2 px-2">
    <span>
      <a class="navbar-brand pl-2" href="/">{{ courseTitle }}</a>
      <span class="nav-item navbar-app">{{ appTitle }}</span>
    </span>
    <span class="navbar-version navbar-text">WODIN v{{ wodinVersion }}</span>
  </nav>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
    name: "AppHeader",
    props: {
        appTitle: String,
        courseTitle: String,
        wodinVersion: String
    }
});
</script>

<style scoped lang="scss">
.navbar-app {
  color: #fff;
  margin-left: 2rem;
}
</style>
