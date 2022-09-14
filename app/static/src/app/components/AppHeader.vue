<template>
  <nav class="navbar navbar-dark bg-brand mb-2 px-2">
    <span>
      <a class="navbar-brand pl-2" href="/">{{ courseTitle }}</a>
      <span class="nav-item navbar-app">{{ appTitle }}</span>
    </span>
    <span class="nav-item dropdown">
      <a id="sessions-menu" class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
         aria-expanded="false">
        Sessions
      </a>
      <ul v-if="initialised" class="dropdown-menu" aria-labelledby="navbarDropdown">
        <li><router-link id="all-sessions-link" class="dropdown-item" to="/sessions">All Sessions</router-link></li>
      </ul>
    </span>
    <span class="navbar-version navbar-text">WODIN v{{ wodinVersion }}</span>
  </nav>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { RouterLink } from "vue-router";
import { useStore } from "vuex";

export default defineComponent({
    name: "AppHeader",
    props: {
        appTitle: String,
        courseTitle: String,
        wodinVersion: String
    },
    components: {
        RouterLink
    },
    setup() {
        const store = useStore();
        const initialised = computed(() => !!store.state.appName);
        return { initialised };
    }
});
</script>

<style scoped lang="scss">
.navbar-app {
  color: #fff;
  margin-left: 2rem;
}

.nav-link {
  color: #fff
}
</style>
