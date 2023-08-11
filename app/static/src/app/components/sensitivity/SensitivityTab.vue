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
      <button class="btn btn-primary" id="download-summary-btn"
              :disabled="downloading || !canDownloadSummary"
              @click="toggleShowDownloadSummary(true)">
        <vue-feather class="inline-icon" type="download"></vue-feather>
        Download Summary
      </button>
      <div v-if="downloading" id="downloading">
        <LoadingSpinner size="xs"></LoadingSpinner>
        Downloading...
      </div>
    </div>
    <DownloadOutput :open="showDownloadSummary"
                    :download-type="'Sensitivity Summary'"
                    :include-points="false"
                    v-model:user-file-name="downloadSummaryUserFileName"
                    @download="downloadSummary"
                    @close="toggleShowDownloadSummary(false)"></DownloadOutput>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";
import VueFeather from "vue-feather";
import DownloadOutput from "@/app/components/DownloadOutput.vue";
import SensitivityTracesPlot from "./SensitivityTracesPlot.vue";
import ActionRequiredMessage from "../ActionRequiredMessage.vue";
import { SensitivityGetter } from "../../store/sensitivity/getters";
import { SensitivityAction } from "../../store/sensitivity/actions";
import userMessages from "../../userMessages";
import { SensitivityPlotType } from "../../store/sensitivity/state";
import SensitivitySummaryPlot from "./SensitivitySummaryPlot.vue";
import ErrorInfo from "../ErrorInfo.vue";
import { sensitivityUpdateRequiredExplanation, verifyValidEndTime } from "./support";
import { anyTrue } from "../../utils";
import LoadingSpinner from "../LoadingSpinner.vue";
import { ModelGetter } from "../../store/model/getters";
import LoadingButton from "../LoadingButton.vue";
import { SensitivityMutation } from "../../store/sensitivity/mutations";

export default defineComponent({
    name: "SensitivityTab",
    components: {
        DownloadOutput,
        VueFeather,
        ErrorInfo,
        LoadingSpinner,
        SensitivitySummaryPlot,
        ActionRequiredMessage,
        SensitivityTracesPlot,
        LoadingButton
    },
    setup() {
        const store = useStore();
        const namespace = "sensitivity";

        const running = computed(() => store.state.sensitivity.running);
        const loading = computed(() => store.state.sensitivity.loading);

        const hasRunner = computed(() => store.getters[`model/${ModelGetter.hasRunner}`]);

        const showDownloadSummary = ref(false);

        const canRunSensitivity = computed(() => {
            return hasRunner.value && !!store.state.model.odin
            && !store.state.model.compileRequired
            && !!store.getters[`${namespace}/${SensitivityGetter.batchPars}`];
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

        const toggleShowDownloadSummary = (show: boolean) => { showDownloadSummary.value = show; };
        const downloading = computed(() => store.state.sensitivity.downloading);
        const downloadSummaryUserFileName = computed({
            get: () => store.state.sensitivity.userSummaryDownloadFileName,
            set: (newVal) => {
                store.commit(`${namespace}/${SensitivityMutation.SetUserSummaryDownloadFileName}`, newVal);
            }
        });
        const downloadSummary = ((payload: { fileName: string }) => {
            verifyValidEndTime(store.state, store.commit);
            store.dispatch(`${namespace}/${SensitivityAction.DownloadSummary}`, payload.fileName);
        });

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

        // only allow download if update not required, and if we have run sensitivity
        const canDownloadSummary = computed(() => !updateMsg.value && store.state.sensitivity.result?.batch);

        const error = computed(() => store.state.sensitivity.result?.error);

        return {
            canRunSensitivity,
            running,
            sensitivityProgressMsg,
            runSensitivity,
            downloading,
            downloadSummary,
            downloadSummaryUserFileName,
            canDownloadSummary,
            showDownloadSummary,
            toggleShowDownloadSummary,
            updateMsg,
            tracesPlot,
            error,
            loading
        };
    }
});
</script>
