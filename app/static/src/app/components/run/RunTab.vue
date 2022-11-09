<template>
    <div class="run-tab">
        <div>
            <button class="btn btn-primary" id="run-btn" :disabled="!canRunModel" @click="runModel">Run model</button>
        </div>
        <action-required-message :message="updateMsg"></action-required-message>
        <run-stochastic-plot v-if="isStochastic" :fade-plot="!!updateMsg"></run-stochastic-plot>
        <run-plot v-else :fade-plot="!!updateMsg" :model-fit="false"></run-plot>
        <error-info :error="error"></error-info>
        <div v-if="sumOfSquares">
          <span class="ms-2">Sum of squares: {{sumOfSquares}}</span>
        </div>
        <div>
          <button v-if="!isStochastic"
                  class="btn btn-primary" id="download-btn"
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
import RunStochasticPlot from "./RunStochasticPlot.vue";

export default defineComponent({
    name: "RunTab",
    components: {
        RunStochasticPlot,
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
        const sumOfSquares = computed(() => {
            const ret = store.state.modelFit.sumOfSquares;
            console.log(`mrc-3796: computed sum of squares: ${ret}`);
            return ret;
        });

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
            // TODO: eventually make runRequired to runUpdateRequired I think?
            if (anyTrue(store.state.run.runRequired)) {
                return runRequiredExplanation(store.state.run.runRequired);
            }
            return "";
        });

        // only allow download if update not required, and if we have a model solution
        const canDownloadOutput = computed(() => !updateMsg.value && store.state.run.resultOde?.solution);
        const toggleShowDownloadOutput = (show: boolean) => { showDownloadOutput.value = show; };

        return {
            canRunModel,
            isStochastic,
            updateMsg,
            runModel,
            error,
            downloading,
            sumOfSquares,
            showDownloadOutput,
            canDownloadOutput,
            toggleShowDownloadOutput
        };
    }
});
</script>
