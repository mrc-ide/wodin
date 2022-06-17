<template>
  <nav class="navbar navbar-dark bg-info">
    <a class="navbar-brand pl-2" href="#">Course Title</a>
    <ul class="navbar-nav mr-auto">
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Session
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
          <a class="dropdown-item" href="#">Action</a>
        </div>
      </li>
    </ul>
    <span class="navbar-text">WODIN v0.0.1</span>
  </nav>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "Header"
});
</script>

<style scoped>

</style>
