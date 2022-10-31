<template>
    <div class="run-tab">
        <div>
            <button class="btn btn-primary" id="run-btn" :disabled="!canRunModel" @click="runModel">Run model</button>
        </div>
        <action-required-message :message="updateMsg"></action-required-message>
        <div v-if="isStochastic" id="stochastic-run-placeholder" class="mt-2">
          {{ stochasticResultSummary }}
          <error-info :error="error"></error-info>
        </div>
        <template v-else>
          <run-plot :fade-plot="!!updateMsg" :model-fit="false"></run-plot>
          <error-info :error="error"></error-info>
          <div>
            <button class="btn btn-primary" id="download-btn"
                    :disabled="downloading || !canDownloadOutput"
                    @click="toggleShowDownloadOutput(true)">
              <vue-feather class="inline-icon" type="download"></vue-feather>
              Download
            </button>
            <div v-if="downloading" id="downloading">
              <LoadingSpinner size="xs"></LoadingSpinner>
              Downloading...
            </div>
          </div>
          <DownloadOutput :open="showDownloadOutput" @close="toggleShowDownloadOutput(false)"></DownloadOutput>
        </template>
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { computed, defineComponent, ref } from "vue";
import VueFeather from "vue-feather";
import RunPlot from "./RunPlot.vue";
import ActionRequiredMessage from "../ActionRequiredMessage.vue";
import { RunAction } from "../../store/run/actions";
import userMessages from "../../userMessages";
import ErrorInfo from "../ErrorInfo.vue";
import DownloadOutput from "../DownloadOutput.vue";
import { runRequiredExplanation } from "./support";
import { anyTrue } from "../../utils";
import LoadingSpinner from "../LoadingSpinner.vue";
import { AppType } from "../../store/appState/state";
import { ModelGetter } from "../../store/model/getters";

export default defineComponent({
    name: "RunTab",
    components: {
        LoadingSpinner,
        RunPlot,
        ErrorInfo,
        ActionRequiredMessage,
        DownloadOutput,
        VueFeather
    },
    setup() {
        const store = useStore();

        const showDownloadOutput = ref(false);
        const isStochastic = computed(() => store.state.appType === AppType.Stochastic);

        const error = computed(() => {
            return isStochastic.value ? store.state.run.resultDiscrete?.error : store.state.run.resultOde?.error;
        });

        const downloading = computed(() => store.state.run.downloading);

        const hasRunner = computed(() => store.getters[`model/${ModelGetter.hasRunner}`]);

        // Enable run button if model has initialised and compile is not required
        const canRunModel = computed(() => {
            return hasRunner.value && !!store.state.model.odin && !store.state.model.compileRequired;
        });

        const runModel = () => store.dispatch(`run/${RunAction.RunModel}`);
        const updateMsg = computed(() => {
            if (store.state.model.compileRequired) {
                return userMessages.run.compileRequired;
            }
            // TOOD: eventually make runRequired to runUpdateRequired I think?
            if (anyTrue(store.state.run.runRequired)) {
                return runRequiredExplanation(store.state.run.runRequired);
            }
            return "";
        });

        // only allow download if update not required, and if we have a model solution
        const canDownloadOutput = computed(() => !updateMsg.value && store.state.run.resultOde?.solution);
        const toggleShowDownloadOutput = (show: boolean) => { showDownloadOutput.value = show; };

        // TODO: This is just a temporary summary message to indicate that the stochastic model has successfully run -
        // it will be replaced by full stochastic run plot in the next ticket
        const stochasticResultSummary = computed(() => {
            if (isStochastic.value) {
                const solution = store.state.run.resultDiscrete?.solution;
                const times = { mode: "grid", times: [0] };
                return solution ? `Stochastic series count: ${solution(times).values.length}`
                    : "Stochastic model has not run";
            }
            return "";
        });

        return {
            canRunModel,
            isStochastic,
            updateMsg,
            runModel,
            error,
            downloading,
            showDownloadOutput,
            canDownloadOutput,
            toggleShowDownloadOutput,
            stochasticResultSummary
        };
    }
});
</script>
