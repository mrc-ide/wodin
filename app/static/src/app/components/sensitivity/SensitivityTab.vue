<template>
  <div class="sensitivity-tab">
    <div>
      <loading-button
        class="btn btn-primary"
        id="run-sens-btn"
        :loading="loading || running"
        :is-disabled="!canRunSensitivity"
        @click="runSensitivity"
        >Run sensitivity</loading-button
      >
    </div>
    <action-required-message :message="updateMsg"></action-required-message>
    <sensitivity-traces-plot v-if="tracesPlot" :fade-plot="!!updateMsg"></sensitivity-traces-plot>
    <sensitivity-summary-plot v-else :fade-plot="!!updateMsg"></sensitivity-summary-plot>
    <div id="sensitivity-running" v-if="running">
      <loading-spinner class="inline-spinner" size="xs"></loading-spinner>
      <span class="ms-2">{{ sensitivityProgressMsg }}</span>
    </div>
    <error-info :error="error"></error-info>
    <sensitivity-summary-download :multi-sensitivity="false" :download-type="'Sensitivity Summary'">
    </sensitivity-summary-download>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import SensitivitySummaryDownload from "@/app/components/sensitivity/SensitivitySummaryDownload.vue";
import SensitivityTracesPlot from "./SensitivityTracesPlot.vue";
import ActionRequiredMessage from "../ActionRequiredMessage.vue";
import { BaseSensitivityGetter } from "../../store/sensitivity/getters";
import { SensitivityAction } from "../../store/sensitivity/actions";
import { SensitivityPlotType } from "../../store/sensitivity/state";
import SensitivitySummaryPlot from "./SensitivitySummaryPlot.vue";
import ErrorInfo from "../ErrorInfo.vue";
import LoadingSpinner from "../LoadingSpinner.vue";
import LoadingButton from "../LoadingButton.vue";
import { SensitivityMutation } from "../../store/sensitivity/mutations";
import baseSensitivity from "../mixins/baseSensitivity";

export default defineComponent({
  name: "SensitivityTab",
  components: {
    ErrorInfo,
    LoadingSpinner,
    SensitivitySummaryPlot,
    ActionRequiredMessage,
    SensitivityTracesPlot,
    LoadingButton,
    SensitivitySummaryDownload
  },
  setup() {
    const store = useStore();
    const { sensitivityPrerequisitesReady, updateMsg } = baseSensitivity(store, false);
    const namespace = "sensitivity";

    const running = computed(() => store.state.sensitivity.running);
    const loading = computed(() => store.state.sensitivity.loading);

    const canRunSensitivity = computed(() => {
      return sensitivityPrerequisitesReady.value && !!store.getters[`${namespace}/${BaseSensitivityGetter.batchPars}`];
    });

    const runSensitivity = () => {
      store.commit(`${namespace}/${SensitivityMutation.SetLoading}`, true);
      // All of the code for sensitivity plot happens synchronously
      // in RunSensitivity action. This means that the loading button's
      // state doesn't get updated until after the calculations are
      // finished so we include a break in our thread to give Vue time
      // to react to loading being true
      setTimeout(() => {
        store.dispatch(`${namespace}/${SensitivityAction.RunSensitivity}`);
      }, 100);
    };

    const sensitivityProgressMsg = computed(() => {
      const batch = store.state.sensitivity.result?.batch;
      const finished = batch ? batch.solutions.length + batch.errors.length : 0;
      const total = store.state.sensitivity.paramSettings.numberOfRuns;
      return `Running sensitivity: finished ${finished} of ${total} runs`;
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
      updateMsg,
      tracesPlot,
      error,
      loading
    };
  }
});
</script>
