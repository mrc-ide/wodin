<template>
    <div class="fit-tab">
        <div>
            <loading-button
                class="btn btn-primary me-2"
                id="fit-btn"
                :loading="fitting"
                :is-disabled="!canFitModel"
                @click="fitModel"
                >Fit model</loading-button
            >
            <button class="btn btn-outline" id="cancel-fit-btn" :disabled="!fitting" @click="cancelFit">
                Cancel fit
            </button>
            <action-required-message :message="actionRequiredMessage"></action-required-message>
            <div v-if="iterations" class="fit-summary-container">
                <vue-feather
                    v-if="iconType"
                    class="inline-icon"
                    :class="iconClass"
                    :type="iconType"
                    size="40px"
                ></vue-feather>
                <loading-spinner v-if="fitting" class="inline-icon" size="xs"></loading-spinner>
                <span class="ms-2">Iterations: {{ iterations }}</span>
                <span class="ms-2">Sum of squares: {{ sumOfSquares }}</span>
                <div v-if="cancelled" id="fit-cancelled-msg" class="small text-danger">{{ cancelledMsg }}</div>
            </div>
            <template v-for="config in graphConfigs" :key="config.id">
                <wodin-plot
                  :fade-plot="!!actionRequiredMessage"
                  :end-time="endTime"
                  :config="config"
                  :graph-group-id="graphGroupId">
                </wodin-plot>
            </template>
            <error-info :error="error"></error-info>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import VueFeather from "vue-feather";
import ActionRequiredMessage from "../ActionRequiredMessage.vue";
import { ModelFitAction } from "../../store/modelFit/actions";
import { ModelFitGetter } from "../../store/modelFit/getters";
import userMessages from "../../userMessages";
import LoadingSpinner from "../LoadingSpinner.vue";
import { ModelFitMutation } from "../../store/modelFit/mutations";
import { fitRequirementsExplanation, fitUpdateRequiredExplanation } from "./support";
import { allTrue, anyTrue, newUid } from "../../utils";
import LoadingButton from "../LoadingButton.vue";
import ErrorInfo from "../ErrorInfo.vue";
import { VisualisationTab } from "@/store/appState/state";
import { FitState } from "@/store/fit/state";
import { ConfigGroupIds } from "@/store/graphs/graphs";
import { GraphsMutation, UpdateConfigPayload, UpdateConfigGroupPayload } from "@/store/graphs/mutations";
import { FitDataGetter } from "@/store/fitData/getters";
import WodinPlot from "../WodinPlot.vue";

const graphGroupId = VisualisationTab.Fit;

export default defineComponent({
    name: "FitTab",
    components: {
        ErrorInfo,
        LoadingSpinner,
        ActionRequiredMessage,
        VueFeather,
        LoadingButton,
        WodinPlot,
    },
    setup() {
        const store = useStore<FitState>();
        const namespace = "modelFit";

        const graphConfigs = computed(() => {
            const { configGroupId } = store.state.graphs.graphGroups[graphGroupId];
            const { configIds } = store.state.graphs.configGroups[configGroupId];
            return store.state.graphs.configs.filter(cfg => configIds.includes(cfg.id));
        });

        const fitRequirements = computed(() => store.getters[`${namespace}/${ModelFitGetter.fitRequirements}`]);
        const canFitModel = computed(() => allTrue(fitRequirements.value));
        const compileRequired = computed(() => store.state.model.compileRequired);
        const fitUpdateRequired = computed(() => store.state.modelFit.fitUpdateRequired);
        const error = computed(() => store.state.modelFit.error);
        const fitModel = () => store.dispatch(`${namespace}/${ModelFitAction.FitModel}`);

        const cancelFit = () => store.commit(`${namespace}/${ModelFitMutation.SetFitting}`, false);

        const iterations = computed(() => store.state.modelFit.iterations);
        const converged = computed(() => store.state.modelFit.converged);
        const fitting = computed(() => store.state.modelFit.fitting);
        const cancelled = computed(() => iterations.value && !fitting.value && !converged.value);
        const sumOfSquares = computed(() => store.state.modelFit.sumOfSquares);

        const actionRequiredMessage = computed(() => {
            if (error.value) {
                return userMessages.modelFit.errorOccurred;
            }

            if (!allTrue(fitRequirements.value)) {
                return fitRequirementsExplanation(fitRequirements.value);
            }
            // This is confusing if the user has not run a fit as it
            // makes it look like some additional action needs
            // taking. The plot already tells the user that the fit
            // needs running, so don't add a message.
            // (We do want to show message when rehydrated - will not have a solution in that case,
            // but will have a result and no error).
            if (!store.state.modelFit.result || store.state.modelFit.error) {
                return "";
            }
            if (compileRequired.value) {
                return userMessages.modelFit.compileRequired;
            }
            if (anyTrue(fitUpdateRequired.value)) {
                return fitUpdateRequiredExplanation(fitUpdateRequired.value);
            }

            return "";
        });

        const cancelledMsg = computed(() => (cancelled.value ? userMessages.modelFit.cancelled : ""));
        const iconType = computed(() => {
            if (cancelled.value) {
                return "alert-circle";
            }
            if (converged.value) {
                return "check";
            }
            return null;
        });
        const iconClass = computed(() => {
            const classes = {
                "alert-circle": "text-secondary",
                check: "text-success"
            };
            return iconType.value ? classes[iconType.value] : null;
        });

        // If we're displaying a reloaded session with fit, we should be able to plot the previous fit plot without
        // re-running fit. Determine if this is the case, by checking if we have a fit result but no fit solution
        // (which is not persisted)
        const plotRehydratedFit = computed(() => {
            const { modelFit } = store.state;
            const result = modelFit.result && !modelFit.result.solution && !modelFit.result.error;
            return result;
        });

        const link = computed(() => {
            return plotRehydratedFit.value
                ? store.state.modelFit.result?.inputs.link
                : store.getters[`fitData/${FitDataGetter.link}`];
        });

        const endTime = computed(() => {
            return plotRehydratedFit.value
                ? store.state.modelFit.result?.inputs.endTime
                : store.getters[`fitData/${FitDataGetter.dataEnd}`];
        });

        onMounted(() => {
            const { configIds } = store.state.graphs.configGroups[ConfigGroupIds.Fit];
            if (configIds.length === 0) {
                const newId = newUid();
                store.commit(`graphs/${GraphsMutation.AddConfig}`, newId);
                if (link.value) {
                    const updateConfigPayload: UpdateConfigPayload = {
                        id: newId,
                        value: { selectedVariables: [link.value.model] }
                    };
                    store.commit(`graphs/${GraphsMutation.UpdateConfig}`, updateConfigPayload);
                }
                const configGroupPayload: UpdateConfigGroupPayload = {
                    id: ConfigGroupIds.Fit,
                    value: { syncProperties: ["xAxisRange"], configIds: [newId] }
                };
                store.commit(`graphs/${GraphsMutation.UpdateConfigGroup}`, configGroupPayload);
            }
            store.commit(`graphs/${GraphsMutation.UpdateVisibleGraphGroups}`, [graphGroupId]);
        });

        return {
            canFitModel,
            fitModel,
            cancelFit,
            iterations,
            converged,
            fitting,
            cancelled,
            cancelledMsg,
            sumOfSquares,
            actionRequiredMessage,
            error,
            iconType,
            iconClass,
            graphConfigs,
            endTime,
            graphGroupId,
        };
    }
});
</script>

<style lang="css" scoped>
.fit-summary-container {
    display: flex;
    align-items: center;
}
</style>
