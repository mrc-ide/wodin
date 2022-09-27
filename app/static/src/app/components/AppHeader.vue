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
        <li class="dropdown-item clickable" @click="toggleEditSessionLabel(true)">Edit Label</li>
        <hr/>
        <li><router-link id="all-sessions-link" class="dropdown-item" to="/sessions">All Sessions</router-link></li>
      </ul>
    </span>
    <span class="navbar-version navbar-text">WODIN v{{ wodinVersion }}</span>
  </nav>
  <edit-session-label :open="editSessionLabelOpen" @close="toggleEditSessionLabel(false)"></edit-session-label>
</template>

<script lang="ts">
import {defineComponent, computed, ref} from "vue";
import { RouterLink } from "vue-router";
import { useStore } from "vuex";
import EditSessionLabel from "./sessions/EditSessionLabel.vue";

export default defineComponent({
    name: "AppHeader",
    props: {
        appTitle: String,
        courseTitle: String,
        wodinVersion: String
    },
    components: {
        RouterLink,
        EditSessionLabel
    },
    setup() {
        const store = useStore();
        const initialised = computed(() => !!store.state.appName);
        const editSessionLabelOpen = ref(false);

        const toggleEditSessionLabel = (edit: boolean) => {
          editSessionLabelOpen.value = edit;
        };

        return {
          initialised,
          toggleEditSessionLabel,
          editSessionLabelOpen
        };
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
