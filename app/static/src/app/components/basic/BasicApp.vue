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
      <wodin-tabs id="right-tabs" :tabNames="['Run', 'Sensitivity']">
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

<script>
import { defineComponent } from "vue";
import WodinApp from "../WodinApp.vue";
import WodinTabs from "../WodinTabs.vue";
import CodeTab from "../code/CodeTab.vue";
import RunTab from "../run/RunTab.vue";
import OptionsTab from "../options/OptionsTab.vue";
import SensitivityTab from "../sensitivity/SensitivityTab.vue";

export default defineComponent({
    name: "BasicApp",
    components: {
        CodeTab,
        RunTab,
        OptionsTab,
        SensitivityTab,
        WodinApp,
        WodinTabs
    }
});
</script>
