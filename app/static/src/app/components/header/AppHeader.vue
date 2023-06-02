<template>
  <nav class="navbar navbar-dark bg-brand mb-2 px-2">
    <span>
      <a class="navbar-brand pl-2" :href="baseUrl">{{ courseTitle }}</a>
      <span class="nav-item navbar-app">{{ appTitle }}</span>
    </span>
    <span class="nav-item dropdown">
      <a id="sessions-menu" class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
         aria-expanded="false">
        {{ sessionMenuHeader }}
      </a>
      <ul v-if="initialised" class="dropdown-menu" aria-labelledby="navbarDropdown">
        <li id="edit-current-session-label" class="dropdown-item clickable" @click="toggleEditSessionLabel(true)">
          <vue-feather class="grey inline-icon" type="edit-2" size="1.3rem"></vue-feather>
          Edit Label
        </li>
        <hr/>
        <li><router-link id="all-sessions-link" class="dropdown-item" to="/sessions">All Sessions</router-link></li>
      </ul>
    </span>
    <span v-if="initialised" style="display: flex; align-items: center;">
      <version-menu :wodin-version="wodinVersion"></version-menu>
      <language-switcher v-if="enableI18n" :languagesKeys="languagesKeys"/>
    </span>
  </nav>
  <edit-session-label id="header-edit-session-label"
                      :open="editSessionLabelOpen"
                      :session-id="sessionId"
                      :session-label="sessionLabel"
                      @close="toggleEditSessionLabel(false)"
  ></edit-session-label>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import VueFeather from "vue-feather";
import { RouterLink } from "vue-router";
import { useStore } from "vuex";
import EditSessionLabel from "../sessions/EditSessionLabel.vue";
import VersionMenu from "./VersionMenu.vue";
import { LanguageSwitcher } from "../../../../translationPackage";
import { Language } from "../../types/languageTypes";

type LanguagesKeys = Record<Language, string>

export default defineComponent({
    name: "AppHeader",
    props: {
        appTitle: String,
        courseTitle: String,
        wodinVersion: String
    },
    components: {
        RouterLink,
        EditSessionLabel,
        VueFeather,
        VersionMenu,
        LanguageSwitcher
    },
    setup() {
        const store = useStore();
        const baseUrl = computed(() => store.state.baseUrl);
        const initialised = computed(() => !!(store.state.appName && baseUrl.value && store.state.appsPath));
        const editSessionLabelOpen = ref(false);

        const toggleEditSessionLabel = (edit: boolean) => {
            editSessionLabelOpen.value = edit;
        };

        const sessionId = computed(() => store.state.sessionId);
        const sessionLabel = computed(() => store.state.sessionLabel);

        const sessionMenuHeader = computed(() => {
            return sessionLabel.value ? `Session: ${sessionLabel.value}` : "Sessions";
        });

        const languagesKeys: LanguagesKeys = {
            [Language.en]: "English",
            [Language.fr]: "Français"
        };
        const enableI18n = computed(() => store.state.language.enableI18n);

        return {
            baseUrl,
            initialised,
            toggleEditSessionLabel,
            editSessionLabelOpen,
            sessionId,
            sessionLabel,
            sessionMenuHeader,
            languagesKeys,
            enableI18n
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
