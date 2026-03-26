<template>
    <div class="run-tab">
        <button class="btn btn-primary" id="run-btn" :disabled="!canRunModel" @click="runModel">Run model</button>
        <action-required-message :message="updateMsg"></action-required-message>
        <div v-if="sumOfSquares">
            <span id="squares">Sum of squares: {{ sumOfSquares }}</span>
        </div>
        <template v-for="config in graphConfigs" :key="config.id">
            <wodin-plot
              :fade-plot="!!updateMsg"
              :end-time="endTime"
              :config="config"
              :graph-group-id="graphGroupId">
            </wodin-plot>
        </template>
        <error-info :error="error"></error-info>
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
import { computed, defineComponent, onMounted, ref } from "vue";
import VueFeather from "vue-feather";
import { RunMutation } from "../../store/run/mutations";
import ActionRequiredMessage from "../ActionRequiredMessage.vue";
import { RunAction } from "../../store/run/actions";
import userMessages from "../../userMessages";
import ErrorInfo from "../ErrorInfo.vue";
import DownloadOutput from "../DownloadOutput.vue";
import { runRequiredExplanation } from "./support";
import { anyTrue, newUid } from "../../utils";
import LoadingSpinner from "../LoadingSpinner.vue";
import { AppType, VisualisationTab } from "../../store/appState/state";
import { ModelGetter } from "../../store/model/getters";
import { getAllSelectedVariables } from "@/store/graphs/utils";
import { FitState } from "@/store/fit/state";
import WodinPlot from "../WodinPlot.vue";
import { GraphsMutation, UpdateConfigPayload, UpdateConfigGroupPayload } from "@/store/graphs/mutations";
import { ConfigGroupIds } from "@/store/graphs/graphs";

const graphGroupId = VisualisationTab.Run;

export default defineComponent({
    name: "RunTab",
    components: {
        LoadingSpinner,
        ErrorInfo,
        ActionRequiredMessage,
        DownloadOutput,
        VueFeather,
        WodinPlot,
    },
    setup() {
        const store = useStore<FitState>();

        const showDownloadOutput = ref(false);

        const isStochastic = computed(() => store.state.appType === AppType.Stochastic);

        const error = computed(() => {
            return isStochastic.value ? store.state.run.resultDiscrete?.error : store.state.run.resultOde?.error;
        });

        const downloading = computed(() => store.state.run.downloading);
        const sumOfSquares = computed(() => store.state.modelFit?.sumOfSquares);

        const hasRunner = computed(() => store.getters[`model/${ModelGetter.hasRunner}`]);
        const allSelectedVariables = computed(() => getAllSelectedVariables(store.state));
        const graphConfigs = computed(() => {
            const { configGroupId } = store.state.graphs.graphGroups[graphGroupId];
            const { configIds } = store.state.graphs.configGroups[configGroupId];
            return store.state.graphs.configs.filter(cfg => configIds.includes(cfg.id));
        });

        const endTime = computed(() => store.state.run.endTime);

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

        onMounted(() => {
            const { configIds } = store.state.graphs.configGroups[ConfigGroupIds.RunAndSens];
            if (configIds.length === 0) {
                const newId = newUid();
                store.commit(`graphs/${GraphsMutation.AddConfig}`, newId);
                const updateConfigPayload: UpdateConfigPayload = {
                    id: newId,
                    value: { selectedVariables: store.state.model.variablesCopy }
                };
                store.commit(`graphs/${GraphsMutation.UpdateConfig}`, updateConfigPayload);
                const configGroupPayload: UpdateConfigGroupPayload = {
                    id: ConfigGroupIds.RunAndSens,
                    value: { syncProperties: ["xAxisRange"], configIds: [newId] }
                };
                store.commit(`graphs/${GraphsMutation.UpdateConfigGroup}`, configGroupPayload);
            }
            store.commit(`graphs/${GraphsMutation.UpdateVisibleGraphGroups}`, [graphGroupId]);
        });

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
            endTime,
            graphGroupId,
        };
    }
});
</script>
