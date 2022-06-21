<template>
  <nav class="navbar navbar-dark bg-brand mb-2 px-2">
    <a class="navbar-brand pl-2" href="/">{{ courseTitle }}</a>
    <span class="navbar-nav navbar-app">{{ appTitle }}</span>
    <span class="navbar-text">WODIN v{{ wodinVersion }}</span>
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
}
</style>
