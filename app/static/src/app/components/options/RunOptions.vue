<template>
    <div class="container">
        <div id="end-time" class="row my-2">
            <div class="col-5">
                <label class="col-form-label">End time</label>
            </div>
            <div class="col-6">
                <numeric-input
                    v-if="endTimeData === 0"
                    :value="endTime"
                    :min-allowed="0"
                    @update="updateEndTime"></numeric-input>
                <label v-else class="col-form-label">{{ endTimeData }} (from data)</label>
            </div>
        </div>
        <div v-if="isStochasticApp" id="number-of-replicates" class="row my-2">
            <div class="col-5">
                <label class="col-form-label">Number of replicates</label>
            </div>
            <div class="col-6">
                <numeric-input
                    :value="numberOfReplicates"
                    :min-allowed="0"
                    :max-allowed="maxAllowedObj"
                    @update="updateNumberOfReplicates"></numeric-input>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { RunMutation } from "../../store/run/mutations";
import { SensitivityMutation } from "../../store/sensitivity/mutations";
import { FitDataGetter } from "../../store/fitData/getters";
import NumericInput, { BoundTooltip } from "./NumericInput.vue";
import { AppType } from "../../store/appState/state";
import { StochasticConfig } from "../../types/responseTypes";

export default defineComponent({
    name: "RunOptions",
    components: {
        NumericInput
    },
    setup() {
        const store = useStore();
        const endTimeData = computed(() => {
            // The fitData getter won't be defined in the basic app,
            // so make sure that we return something sensible.
            const dataEnd = store.getters[`fitData/${FitDataGetter.dataEnd}`];
            return dataEnd === undefined ? 0 : dataEnd;
        });
        const endTime = computed(() => store.state.run.endTime);

        const updateEndTime = (newValue: number) => {
            store.commit(`run/${RunMutation.SetEndTime}`, newValue);
            store.commit(`sensitivity/${SensitivityMutation.SetEndTime}`, newValue);
        };

        const numberOfReplicates = computed(() => store.state.run.numberOfReplicates);
        const isStochasticApp = computed(() => store.state.appType === AppType.Stochastic);

        const maxReplicatesDisplay = computed(() => {
            return (store.state.config as StochasticConfig)?.maxReplicatesDisplay;
        });
        const maxReplicatesRun = computed(() => {
            return (store.state.config as StochasticConfig)?.maxReplicatesRun;
        });
        const maxAllowedObj = computed(() => {
            return {
                error: { number: maxReplicatesRun.value },
                warning: {
                    number: maxReplicatesDisplay.value,
                    message: "Individual traces will not be shown for "
                        + `values greater than ${maxReplicatesDisplay.value}`
                }
            } as BoundTooltip;
        });

        const updateNumberOfReplicates = (newValue: number) => {
            store.commit(`run/${RunMutation.SetNumberOfReplicates}`, newValue);
            store.commit(`sensitivity/${SensitivityMutation.SetUpdateRequired}`, {
                numberOfReplicatesChanged: true
            });
        };

        return {
            endTime,
            endTimeData,
            updateEndTime,
            isStochasticApp,
            numberOfReplicates,
            updateNumberOfReplicates,
            maxAllowedObj
        };
    }
});
</script>
