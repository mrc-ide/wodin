<template>
  <nav class="navbar navbar-dark bg-brand mb-2 px-2">
    <a class="navbar-brand pl-2" href="/">Course Title</a>
    <span class="navbar-nav mr-auto">{{ appTitle }}</span>
    <span class="navbar-text">WODIN v0.0.1</span>
  </nav>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
    name: "AppHeader",
    props: {
        appTitle: String
    }
});
</script>
