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
        <sensitivity-options></sensitivity-options>
    </div>
</template>

<script lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import VerticalCollapse from "../VerticalCollapse.vue";
import ParameterValues from "./ParameterValues.vue";
import RunOptions from "./RunOptions.vue";
import LinkData from "./LinkData.vue";
import SensitivityOptions from "./SensitivityOptions.vue";
import { AppType } from "../../store/appState/state";

export default {
    name: "OptionsTab",
    components: {
        LinkData,
        ParameterValues,
        RunOptions,
        SensitivityOptions,
        VerticalCollapse
    },
    setup() {
        const store = useStore();
        const isFit = computed(() => store.state.appType === AppType.Fit);

        // TODO: only show Sensitivity options when Sensitivity tab is open (after mrc-3322 has been merged in)
        // TODO: at same time, default all non-sensitivity options to collapsed when switch to Sensitivity tab

        return {
            isFit
        };
    }
};
</script>
