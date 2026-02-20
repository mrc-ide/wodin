<template>
    <div class="sensitivity-tab">
        <div v-if="!hideSensitivityButton">
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
        <template v-for="graph in graphs" :key="graph.id">
            <wodin-plot :fade-plot="!!updateMsg" :graph="graph"/>
        </template>
        <div id="sensitivity-running" v-if="running">
            <loading-spinner class="inline-spinner" size="xs"></loading-spinner>
            <span class="ms-2">{{ sensitivityProgressMsg }}</span>
        </div>
        <error-info :error="error"></error-info>
        <sensitivity-summary-download v-if="!hideDownloadButton" :multi-sensitivity="false" :download-type="'Sensitivity Summary'">
        </sensitivity-summary-download>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, onMounted } from "vue";
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
import { GraphsAction, UpdateGraphPayload } from "@/store/graphs/actions";
import { STATIC_BUILD } from "@/parseEnv";
import { AppState } from "@/store/appState/state";
import WodinPlot from "../WodinPlot.vue";

export default defineComponent({
    name: "SensitivityTab",
    components: {
        ErrorInfo,
        LoadingSpinner,
        ActionRequiredMessage,
        LoadingButton,
        SensitivitySummaryDownload,
        WodinPlot
    },
    props: {
        hideSensitivityButton: { type: Boolean, default: false },
        hideDownloadButton: { type: Boolean, default: false },
        visibleVars: { type: String as PropType<string | null>, default: null }
    },
    setup(props) {
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

        const graphs = computed(() => store.state.graphs.graphs);

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
            if (props.visibleVars && STATIC_BUILD) {
                const visibleVars = props.visibleVars.split(",").map(s => s.trim());
                graphs.value.forEach(g => {
                    store.dispatch(`graphs/${GraphsAction.UpdateGraph}`, {
                        id: g.id,
                        config: { selectedVariables: visibleVars }
                    } as UpdateGraphPayload);
                });
            }
        });

        return {
            graphs,
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
