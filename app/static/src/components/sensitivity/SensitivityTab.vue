<template>
    <div class="sensitivity-tab">
        <loading-button
            class="btn btn-primary"
            id="run-sens-btn"
            :loading="loading || running"
            :is-disabled="!canRunSensitivity"
            @click="runSensitivity"
            >Run sensitivity</loading-button
        >
        <action-required-message :message="updateMsg"></action-required-message>
        <template v-for="config in graphConfigs" :key="config.id">
            <wodin-plot
              :fade-plot="!!updateMsg"
              :end-time="endTime"
              :config="config"
              :graph-group-id="graphGroupId">
            </wodin-plot>
        </template>
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
import { computed, defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import SensitivitySummaryDownload from "@/components/sensitivity/SensitivitySummaryDownload.vue";
import ActionRequiredMessage from "../ActionRequiredMessage.vue";
import { BaseSensitivityGetter } from "../../store/sensitivity/getters";
import { SensitivityAction } from "../../store/sensitivity/actions";
import { SensitivityPlotType } from "../../store/sensitivity/state";
import ErrorInfo from "../ErrorInfo.vue";
import LoadingSpinner from "../LoadingSpinner.vue";
import LoadingButton from "../LoadingButton.vue";
import { SensitivityMutation } from "../../store/sensitivity/mutations";
import baseSensitivity from "../mixins/baseSensitivity";
import { AppState, VisualisationTab } from "@/store/appState/state";
import { ConfigGroupIds } from "@/store/graphs/graphs";
import { newUid } from "@/utils";
import { GraphsMutation, UpdateConfigPayload, UpdateConfigGroupPayload } from "@/store/graphs/mutations";
import WodinPlot from "../WodinPlot.vue";
import { getGraphConfigs } from "@/store/graphs/utils";

const graphGroupId = VisualisationTab.Sensitivity;

export default defineComponent({
    name: "SensitivityTab",
    components: {
        ErrorInfo,
        LoadingSpinner,
        ActionRequiredMessage,
        LoadingButton,
        SensitivitySummaryDownload,
        WodinPlot,
    },
    setup() {
        const store = useStore<AppState>();
        const { sensitivityPrerequisitesReady, updateMsg } = baseSensitivity(store, false);
        const namespace = "sensitivity";

        const running = computed(() => store.state.sensitivity.running);
        const loading = computed(() => store.state.sensitivity.loading);

        const canRunSensitivity = computed(() => {
            return (
                sensitivityPrerequisitesReady.value &&
                !!store.getters[`${namespace}/${BaseSensitivityGetter.batchPars}`]
            );
        });

        const endTime = computed(() => store.state.run.endTime);

        const graphConfigs = computed(() => getGraphConfigs(store, graphGroupId));

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
            graphConfigs,
            canRunSensitivity,
            running,
            sensitivityProgressMsg,
            runSensitivity,
            updateMsg,
            tracesPlot,
            error,
            loading,
            graphGroupId,
            endTime,
        };
    }
});
</script>
