<template>
  <div class="sensitivity-tab">
    <div>
      <button class="btn btn-primary"
              id="run-sens-btn"
              :disabled="!canRunSensitivity"
              @click="runSensitivity">Run sensitivity</button>
    </div>
    <div v-if="isStochastic" id="stochastic-sens-placeholder" class="mt-2">Stochastic sensitivity coming soon</div>
    <template v-else>
      <action-required-message :message="updateMsg"></action-required-message>
      <sensitivity-traces-plot v-if="tracesPlot" :fade-plot="!!updateMsg"></sensitivity-traces-plot>
      <sensitivity-summary-plot v-else :fade-plot="!!updateMsg"></sensitivity-summary-plot>
    </template>
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
import { sensitivityUpdateRequiredExplanation } from "./support";
import { anyTrue } from "../../utils";
import { AppType } from "../../store/appState/state";

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

        const isStochastic = computed(() => store.state.appType === AppType.Stochastic);
        // TODO: Enable for Stochastic when stochastic sensitivity is implemented
        const canRunSensitivity = computed(() => {
            return !!store.state.model.odinRunnerOde && !!store.state.model.odin
            && !store.state.model.compileRequired
            && !!store.getters[`sensitivity/${SensitivityGetter.batchPars}`]
            && !isStochastic.value;
        });

        const runSensitivity = () => {
            store.dispatch(`sensitivity/${SensitivityAction.RunSensitivity}`);
        };

        const sensitivityUpdateRequired = computed(() => store.state.sensitivity.sensitivityUpdateRequired);
        const updateMsg = computed(() => {
            if (store.state.sensitivity.result?.batch?.solutions.length) {
                if (store.state.model.compileRequired) {
                    return userMessages.sensitivity.compileRequiredForUpdate;
                }
                if (anyTrue(sensitivityUpdateRequired.value)) {
                    return sensitivityUpdateRequiredExplanation(sensitivityUpdateRequired.value);
                }
            }
            return "";
        });

        const tracesPlot = computed(
            () => store.state.sensitivity.plotSettings.plotType === SensitivityPlotType.TraceOverTime
        );

        const error = computed(() => store.state.sensitivity.result?.error);

        return {
            canRunSensitivity,
            isStochastic,
            runSensitivity,
            updateMsg,
            tracesPlot,
            error
        };
    }
});
</script>
