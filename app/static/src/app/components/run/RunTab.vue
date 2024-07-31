<template>
    <div class="run-tab">
        <div>
            <button class="btn btn-primary" id="run-btn" :disabled="!canRunModel" @click="runModel">Run model</button>
        </div>
        <action-required-message :message="updateMsg"></action-required-message>
        <template v-for="(config, index) in graphConfigs" :key="config.id">
            <run-stochastic-plot
                v-if="isStochastic"
                :fade-plot="!!updateMsg"
                :graph-config="config"
                :graph-index="index"
                :linked-x-axis="xAxis"
                @updateXAxis="updateXAxis"
            ></run-stochastic-plot>
            <run-plot
                v-else
                :fade-plot="!!updateMsg"
                :model-fit="false"
                :graph-config="config"
                :graph-index="index"
                :linked-x-axis="xAxis"
                @updateXAxis="updateXAxis"
            >
            </run-plot>
        </template>
        <div v-if="sumOfSquares">
          <span>Sum of squares: {{ sumOfSquares }}</span>
        </div>
        <error-info :error="error"></error-info>
        <div>
            <button
                v-if="!isStochastic"
                class="btn btn-primary"
                id="download-btn"
                :disabled="downloading || !canDownloadOutput"
                @click="toggleShowDownloadOutput(true)"
            >
                <vue-feather size="20" class="inline-icon" type="download"></vue-feather>
                Download
            </button>
            <div v-if="downloading" id="downloading">
                <LoadingSpinner size="xs"></LoadingSpinner>
                Downloading...
            </div>
        </div>
        <DownloadOutput
            :open="showDownloadOutput"
            :download-type="'Run'"
            :include-points="true"
            v-model:user-file-name="downloadUserFileName"
            @download="download"
            @close="toggleShowDownloadOutput(false)"
        ></DownloadOutput>
    </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { computed, defineComponent, Ref, ref } from "vue";
import VueFeather from "vue-feather";
import { LayoutAxis } from "plotly.js-basic-dist-min";
import { RunMutation } from "../../store/run/mutations";
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
import { GraphsGetter } from "../../store/graphs/getters";

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
        const xAxis: Ref<Partial<LayoutAxis>> = ref({ autorange: true });

        const isStochastic = computed(() => store.state.appType === AppType.Stochastic);

        const error = computed(() => {
            return isStochastic.value ? store.state.run.resultDiscrete?.error : store.state.run.resultOde?.error;
        });

        const downloading = computed(() => store.state.run.downloading);
        const sumOfSquares = computed(() => store.state.modelFit?.sumOfSquares);

        const hasRunner = computed(() => store.getters[`model/${ModelGetter.hasRunner}`]);
        const allSelectedVariables = computed(() => store.getters[`graphs/${GraphsGetter.allSelectedVariables}`]);
        const graphConfigs = computed(() => store.state.graphs.config);

        // Enable run button if model has initialised and compile is not required
        const canRunModel = computed(() => {
            return hasRunner.value && !!store.state.model.odin && !store.state.model.compileRequired;
        });

        const downloadUserFileName = computed({
            get: () => store.state.run.userDownloadFileName,
            set: (newVal) => {
                store.commit(`run/${RunMutation.SetUserDownloadFileName}`, newVal);
            }
        });

        const runModel = () => store.dispatch(`run/${RunAction.RunModel}`);
        const updateMsg = computed(() => {
            if (store.state.model.compileRequired) {
                return userMessages.run.compileRequired;
            }
            if (!allSelectedVariables.value.length) {
                return userMessages.model.selectAVariable;
            }
            // TODO: eventually make runRequired to runUpdateRequired I think?
            if (anyTrue(store.state.run.runRequired)) {
                return runRequiredExplanation(store.state.run.runRequired);
            }
            return "";
        });

        // only allow download if update not required, and if we have a model solution
        const canDownloadOutput = computed(() => !updateMsg.value && store.state.run.resultOde?.solution);
        const toggleShowDownloadOutput = (show: boolean) => {
            showDownloadOutput.value = show;
        };

        const download = (payload: { fileName: string; points: number }) =>
            store.dispatch(`run/${RunAction.DownloadOutput}`, payload);

        const updateXAxis = (newAxis: Partial<LayoutAxis>) => {
            xAxis.value = newAxis;
        };

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
            downloadUserFileName,
            toggleShowDownloadOutput,
            download,
            graphConfigs,
            xAxis,
            updateXAxis
        };
    }
});
</script>
