<template>
  <div class="sensitivity-tab">
    <div>
      <button class="btn btn-primary"
              id="run-sens-btn"
              :disabled="!canRunSensitivity"
              @click="runSensitivity">Run sensitivity</button>
    </div>
    <action-required-message :message="updateMsg"></action-required-message>
    <sensitivity-traces-plot v-if="tracesPlot" :fade-plot="!!updateMsg"></sensitivity-traces-plot>
    <sensitivity-summary-plot v-else-if="valueAtTimePlot" :fade-plot="!!updateMsg"></sensitivity-summary-plot>
    <div v-else id="sensitivity-plot-placeholder">Other plot types coming soon!</div>
    <error-info :error="error"></error-info>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import SensitivityTracesPlot from "./SensitivityTracesPlot.vue";
import ActionRequiredMessage from "../ActionRequiredMessage.vue";
import { SensitivityGetter } from "../../store/sensitivity/getters";
import { SensitivityAction } from "../../store/sensitivity/actions";
import userMessages from "../../userMessages";
import { SensitivityPlotType } from "../../store/sensitivity/state";
import SensitivitySummaryPlot from "./SensitivitySummaryPlot.vue";
import ErrorInfo from "../ErrorInfo.vue";

export default defineComponent({
    name: "SensitivityTab",
    components: {
        ErrorInfo,
        SensitivitySummaryPlot,
        ActionRequiredMessage,
        SensitivityTracesPlot
    },
    setup() {
        const store = useStore();
        const canRunSensitivity = computed(() => {
            return !!store.state.model.odinRunner && !!store.state.model.odin
            && !store.state.model.compileRequired
            && !!store.getters[`sensitivity/${SensitivityGetter.batchPars}`];
        });

        const runSensitivity = () => {
            store.dispatch(`sensitivity/${SensitivityAction.RunSensitivity}`);
        };

        const sensitivityUpdateRequired = computed(() => store.state.sensitivity.sensitivityUpdateRequired);
        const updateMsg = computed(() => {
            if (store.state.sensitivity.batch?.solutions.length) {
                if (store.state.model.compileRequired) {
                    return userMessages.sensitivity.compileRequiredForUpdate;
                }
                if (sensitivityUpdateRequired.value) {
                    return userMessages.sensitivity.runRequiredForUpdate;
                }
            }
            return "";
        });

        const tracesPlot = computed(
            () => store.state.sensitivity.plotSettings.plotType === SensitivityPlotType.TraceOverTime
        );

        // TODO: we can remove this once other summary plot types are implemented
        const valueAtTimePlot = computed(
            () => store.state.sensitivity.plotSettings.plotType === SensitivityPlotType.ValueAtTime
        );

        const error = computed(() => store.state.sensitivity.error);

        return {
            canRunSensitivity,
            runSensitivity,
            updateMsg,
            tracesPlot,
            valueAtTimePlot,
            error
        };
    }
});
</script>
