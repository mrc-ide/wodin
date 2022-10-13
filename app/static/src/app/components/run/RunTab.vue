<template>
    <div class="run-tab">
        <div>
            <button class="btn btn-primary" id="run-btn" :disabled="!canRunModel" @click="runModel">Run model</button>
        </div>
        <action-required-message :message="updateMsg"></action-required-message>
        <run-plot :fade-plot="!!updateMsg" :model-fit="false"></run-plot>
        <error-info :error="error"></error-info>
        <div>
          <button class="btn btn-primary" id="download-btn"
                  :disabled="!canDownloadOutput"
                  @click="toggleShowDownloadOutput(true)">
            Download
          </button>
        </div>
        <DownloadOutput :open="showDownloadOutput" @close="toggleShowDownloadOutput(false)"></DownloadOutput>
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { computed, defineComponent, ref } from "vue";
import RunPlot from "./RunPlot.vue";
import ActionRequiredMessage from "../ActionRequiredMessage.vue";
import { RunAction } from "../../store/run/actions";
import userMessages from "../../userMessages";
import ErrorInfo from "../ErrorInfo.vue";
import DownloadOutput from "../DownloadOutput.vue";
import { runRequiredExplanation } from "./support";
import { anyTrue } from "../../utils";

export default defineComponent({
    name: "RunTab",
    components: {
        RunPlot,
        ErrorInfo,
        ActionRequiredMessage,
        DownloadOutput
    },
    setup() {
        const store = useStore();

        const showDownloadOutput = ref(false);

        const error = computed(() => store.state.run.result?.error);

        // Enable run button if model has initialised and compile is not required
        const canRunModel = computed(() => !!store.state.model.odinRunner && !!store.state.model.odin
            && !store.state.model.compileRequired);

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
        const canDownloadOutput = computed(() => !updateMsg.value && store.state.run.result?.solution);
        const toggleShowDownloadOutput = (show: boolean) => { showDownloadOutput.value = show; };

        return {
            canRunModel,
            updateMsg,
            runModel,
            error,
            showDownloadOutput,
            canDownloadOutput,
            toggleShowDownloadOutput
        };
    }
});
</script>
