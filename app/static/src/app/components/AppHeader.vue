<template>
  <nav class="navbar navbar-dark bg-brand mb-2 px-2" style="height:3.1rem">
    <span>
      <a class="navbar-brand pl-2" href="/">{{ courseTitle }}</a>
      <span class="nav-item navbar-app">{{ appTitle }}</span>
    </span>
    <span class="nav-item dropdown">
      <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="color:white;">
        Session: Vary D Parameter (saved 14:37:12)
      </a>
      <ul class="dropdown-menu" aria-labelledby="navbarDropdown" style="margin-left: 14rem;">
        <li><a class="dropdown-item" href="#"><vue-feather class="me-1" size="1rem" stroke-width="1" type="edit-2" style="vertical-align: middle;"></vue-feather>Edit label</a></li>
        <li><a class="dropdown-item" href="#"><vue-feather class="me-1" size="1rem" stroke-width="1" type="copy" style="vertical-align: middle;"></vue-feather>Copy share link</a></li>
        <li><a class="dropdown-item" href="#"><vue-feather class="me-1" size="1rem" stroke-width="1" type="copy" style="vertical-align: middle;"></vue-feather>Copy share code</a></li>

        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#">All Sessions</a></li>
      </ul>
    </span>

    <span class="navbar-version navbar-text">
      WODIN v{{ wodinVersion }}
    </span>
  </nav>
</template>

<script>
import { defineComponent } from "vue";
import VueFeather from "vue-feather";


export default defineComponent({
    name: "AppHeader",
    props: {
        appTitle: String,
        courseTitle: String,
        wodinVersion: String
    },
    components: {
      VueFeather
    }
});
</script>

<style scoped lang="scss">
.navbar-app {
  color: #fff;
  margin-left: 2rem;
}
</style>
