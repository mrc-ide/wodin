<template>
    <div>
        <vertical-collapse v-if="isFit" title="Link" collapse-id="link-data">
          <link-data></link-data>
        </vertical-collapse>
        <vertical-collapse title="Model Parameters" collapse-id="model-params">
          <parameter-values></parameter-values>
        </vertical-collapse>
        <vertical-collapse title="Run Options" collapse-id="run-options">
          <run-options></run-options>
        </vertical-collapse>
        <vertical-collapse v-if="fitTabIsOpen" title="Optimisation" collapse-id="optimisation">
          <optimisation-options></optimisation-options>
        </vertical-collapse>
    </div>
</template>

<script lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import VerticalCollapse from "../VerticalCollapse.vue";
import ParameterValues from "./ParameterValues.vue";
import RunOptions from "./RunOptions.vue";
import LinkData from "./LinkData.vue";
import OptimisationOptions from "./OptimisationOptions.vue";
import { AppType, VisualisationTab } from "../../store/appState/state";

export default {
    name: "OptionsTab",
    components: {
        LinkData,
        OptimisationOptions,
        ParameterValues,
        RunOptions,
        VerticalCollapse
    },
    setup() {
        const store = useStore();
        const isFit = computed(() => store.state.appType === AppType.Fit);
        const fitTabIsOpen = computed(() => store.state.openVisualisationTab === VisualisationTab.Fit);

        return {
            isFit,
            fitTabIsOpen
        };
    }
};
</script>
