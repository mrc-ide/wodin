<template>
  <div class="sensitivity-tab">
    <div>
      <loading-button class="btn btn-primary"
              id="run-sens-btn"
              :loading="loading || running"
              :is-disabled="!canRunSensitivity"
              @click="runSensitivity">Run sensitivity</loading-button>
    </div>
    <action-required-message :message="updateMsg"></action-required-message>
    <sensitivity-traces-plot v-if="tracesPlot" :fade-plot="!!updateMsg"></sensitivity-traces-plot>
    <sensitivity-summary-plot v-else :fade-plot="!!updateMsg"></sensitivity-summary-plot>
    <div id="sensitivity-running" v-if="running">
      <loading-spinner class="inline-spinner" size="xs"></loading-spinner>
      <span class="ms-2">{{ sensitivityProgressMsg }}</span>
    </div>
    <error-info :error="error"></error-info>
    <div>
      Change this!
      <button @click="downloadSummary">Download summary</button>
    </div>
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
import LoadingSpinner from "../LoadingSpinner.vue";
import { ModelGetter } from "../../store/model/getters";
import LoadingButton from "../LoadingButton.vue";
import { SensitivityMutation } from "../../store/sensitivity/mutations";

export default defineComponent({
    name: "SensitivityTab",
    components: {
        ErrorInfo,
        LoadingSpinner,
        SensitivitySummaryPlot,
        ActionRequiredMessage,
        SensitivityTracesPlot,
        LoadingButton
    },
    setup() {
        const store = useStore();

        const running = computed(() => store.state.sensitivity.running);
        const loading = computed(() => store.state.sensitivity.loading);

        const hasRunner = computed(() => store.getters[`model/${ModelGetter.hasRunner}`]);

        const canRunSensitivity = computed(() => {
            return hasRunner.value && !!store.state.model.odin
            && !store.state.model.compileRequired
            && !!store.getters[`sensitivity/${SensitivityGetter.batchPars}`];
        });

        const runSensitivity = () => {
            store.commit(`sensitivity/${SensitivityMutation.SetLoading}`, true);
            // All of the code for sensitivity plot happens synchronously
            // in RunSensitivity action. This means that the loading button's
            // state doesn't get updated until after the calculations are
            // finished so we include a break in our thread to give Vue time
            // to react to loading being true
            setTimeout(() => {
                store.dispatch(`sensitivity/${SensitivityAction.RunSensitivity}`);
            }, 100);
        };

        const downloadSummary = (() => store.dispatch(`sensitivity/${SensitivityAction.DownloadSummary}`, "test.xlsx"));

        const sensitivityProgressMsg = computed(() => {
            const batch = store.state.sensitivity.result?.batch;
            const finished = batch ? batch.solutions.length + batch.errors.length : 0;
            const total = store.state.sensitivity.paramSettings.numberOfRuns;
            return `Running sensitivity: finished ${finished} of ${total} runs`;
        });

        const sensitivityUpdateRequired = computed(() => store.state.sensitivity.sensitivityUpdateRequired);
        const updateMsg = computed(() => {
            if (store.state.sensitivity.result?.batch?.solutions.length) {
                if (store.state.model.compileRequired) {
                    return userMessages.sensitivity.compileRequiredForUpdate;
                }

                if (!store.state.model.selectedVariables.length) {
                    return userMessages.model.selectAVariable;
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
            running,
            sensitivityProgressMsg,
            runSensitivity,
            downloadSummary,
            updateMsg,
            tracesPlot,
            error,
            loading
        };
    }
});
</script>
