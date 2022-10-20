<template>
  <wodin-app :app-name="appName">
    <template v-slot:left>
      <wodin-tabs id="left-tabs" :tabNames="['Code', 'Options']">
        <template v-slot:Code>
          <code-tab></code-tab>
        </template>
        <template v-slot:Options>
          <options-tab></options-tab>
        </template>
      </wodin-tabs>
    </template>
    <template v-slot:right>
      <wodin-tabs id="right-tabs" :tabNames="['Run', 'Sensitivity']" @tabSelected="rightTabSelected">
        <template v-slot:Run>
          <run-tab></run-tab>
        </template>
        <template v-slot:Sensitivity>
          <sensitivity-tab></sensitivity-tab>
        </template>
      </wodin-tabs>
    </template>
  </wodin-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { VisualisationTab } from "../../store/appState/state";
import { AppStateMutation } from "../../store/appState/mutations";
import WodinTabs from "../WodinTabs.vue";
import WodinApp from "../WodinApp.vue";

export default defineComponent({
    name: "StochasticApp",
    components: {
        WodinApp,
        WodinTabs
    },
    setup() {
        const store = useStore();
        const rightTabNames = [VisualisationTab.Run, VisualisationTab.Sensitivity];
        const rightTabSelected = (tab: string) => { store.commit(AppStateMutation.SetOpenVisualisationTab, tab); };

        return {
            rightTabNames,
            rightTabSelected
        };
    }
});
</script>
