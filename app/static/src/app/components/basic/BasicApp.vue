<template>
  <wodin-app>
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
import {computed, defineComponent} from "vue";
import { useStore } from "vuex";
import WodinApp from "../WodinApp.vue";
import WodinTabs from "../WodinTabs.vue";
import CodeTab from "../code/CodeTab.vue";
import RunTab from "../run/RunTab.vue";
import OptionsTab from "../options/OptionsTab.vue";
import SensitivityTab from "../sensitivity/SensitivityTab.vue";
import { AppStateMutation } from "../../store/appState/mutations";
import { VisualisationTab } from "../../store/appState/state";

export default defineComponent({
    name: "BasicApp",
    components: {
        CodeTab,
        RunTab,
        OptionsTab,
        SensitivityTab,
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
