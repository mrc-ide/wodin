<template>
  <wodin-app>
    <template v-slot:left>
      <wodin-tabs id="left-tabs" :tabNames="['Code']">
        <template v-slot:Code>
          Coming soon: Stochastic apps
        </template>
      </wodin-tabs>
    </template>
    <template v-slot:right>
      <wodin-tabs id="right-tabs" :tabNames="['Run']">
        <template v-slot:Run>
          Coming soon: Stochastic apps
        </template>
      </wodin-tabs>
    </template>
  </wodin-app>
</template>

<script>
import { defineComponent } from "vue";
import WodinApp from "../WodinApp.vue";
import WodinTabs from "../WodinTabs.vue";

export default defineComponent({
    name: "StochasticApp",
    components: {
        WodinApp,
        WodinTabs
    }
});
</script>
