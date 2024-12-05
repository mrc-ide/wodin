<template>
  <app-header
      :app-title="appTitleGlobal"
      :course-title="courseTitleGlobal"
      :wodin-version="wodinVersionGlobal">
  </app-header>
  <wodin-session :app-name="appNameGlobal"
                  :base-url="baseUrlGlobal"
                  :apps-path="appsPathGlobal"
                  :enable-i18n="enableI18nGlobal"
                  :default-language="defaultLanguageGlobal"
                  :load-session-id="loadSessionIdGlobal"
                  :share-not-found="shareNotFoundGlobal"></wodin-session>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import WodinSession from './WodinSession.vue';
import AppHeader from './header/AppHeader.vue';

declare let appTitleGlobal: string;
declare let courseTitleGlobal: string;
declare let wodinVersionGlobal: string;
declare let appNameGlobal: string;
declare let baseUrlGlobal: string;
declare let appsPathGlobal: string;
declare let enableI18nGlobal: boolean;
declare let defaultLanguageGlobal: string;
declare let loadSessionIdGlobal: string;
declare let shareNotFoundGlobal: string;

export default defineComponent({
  components: {
    WodinSession,
    AppHeader
  },
  setup() {
      return {
        appTitleGlobal,
        courseTitleGlobal,
        wodinVersionGlobal,
        appNameGlobal,
        baseUrlGlobal,
        appsPathGlobal,
        enableI18nGlobal,
        defaultLanguageGlobal,
        loadSessionIdGlobal,
        shareNotFoundGlobal
      }
  },
})
</script>
