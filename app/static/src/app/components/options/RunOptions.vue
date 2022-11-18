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
                    :allow-negative="false"
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
                    :allow-negative="false"
                    :max-allowed-value="maxReplicatesRun"
                  @update="updateNumberOfReplicates"></numeric-input>
            </div>
        </div>
        <div v-if="isStochasticApp" class="row my-2 small text-danger">
          <div id="hide-individual-traces" class="col-12" style="min-height: 1.5rem;">
            {{ showIndividualTraces ? "" : hideIndividualTracesMessage }}
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
import NumericInput from "./NumericInput.vue";
import { AppType } from "../../store/appState/state";
import userMessages from "../../userMessages";
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

        const maxReplicatesDisplay = computed(() => (store.state.config as StochasticConfig).maxReplicatesDisplay || 50);
        const maxReplicatesRun = computed(() => (store.state.config as StochasticConfig).maxReplicatesRun || 1000);
        const showIndividualTraces = computed(() => numberOfReplicates.value && numberOfReplicates.value <= maxReplicatesDisplay.value);
        const hideIndividualTracesMessage = userMessages.stochastic.individualTracesHidden;

        const updateNumberOfReplicates = (newValue: number) => {
            // An alternative here would be to have an
            // UpdateNumberOfReplicates action on the run store which
            // does all these bits
            store.commit(`run/${RunMutation.SetNumberOfReplicates}`, newValue);
            store.commit(`run/${RunMutation.SetShowIndividualTraces}`, showIndividualTraces.value);
            // This seems to duplicate something in the run mutations code; surely one of these should be done at most?
            store.commit(`sensitivity/${SensitivityMutation.SetUpdateRequired}`, {
                numberOfReplicatesChanged: true
            });
        };

        return {
            endTime,
            endTimeData,
            updateEndTime,
            isStochasticApp,
            maxReplicatesRun,
            numberOfReplicates,
            showIndividualTraces,
            updateNumberOfReplicates,
            hideIndividualTracesMessage
        };
    }
});
</script>
