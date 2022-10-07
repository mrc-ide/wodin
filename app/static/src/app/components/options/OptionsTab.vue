<template>
    <div>
        <sensitivity-options v-if="sensitivityOpen"></sensitivity-options>
        <vertical-collapse v-if="isFit" title="Link" collapse-id="link-data">
          <link-data></link-data>
        </vertical-collapse>
        <div>
            <button class="btn btn-primary btn-sm mb-2"
                    id="reset-params-btn"
                    @click="reset">Reset
            </button>
        </div>
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
import SensitivityOptions from "./SensitivityOptions.vue";
import OptimisationOptions from "./OptimisationOptions.vue";
import { AppType, VisualisationTab } from "../../store/appState/state";
import { RunMutation } from "../../store/run/mutations";
import { OdinParameter, OdinUserType } from "../../types/responseTypes";

export default {
    name: "OptionsTab",
    components: {
        LinkData,
        OptimisationOptions,
        ParameterValues,
        RunOptions,
        SensitivityOptions,
        VerticalCollapse
    },
    setup() {
        const store = useStore();
        const isFit = computed(() => store.state.appType === AppType.Fit);

        const sensitivityOpen = computed(() => store.state.openVisualisationTab === VisualisationTab.Sensitivity);
        const fitTabIsOpen = computed(() => store.state.openVisualisationTab === VisualisationTab.Fit);
        const odinParameters = computed(() => store.state.model.odinModelResponse.metadata.parameters);

        const reset = () => {
            const defaultParams: OdinUserType = {};
            odinParameters.value.forEach((param: OdinParameter) => {
                if (param.default) {
                    defaultParams[param.name] = param.default;
                }
            });
            store.commit(`run/${RunMutation.SetParameterValues}`, defaultParams);
        };

        return {
            reset,
            isFit,
            sensitivityOpen,
            fitTabIsOpen
        };
    }
};
</script>
