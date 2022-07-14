<template>
  <div class="fit-tab">
    <div>
      <button class="btn btn-primary" id="fit-btn" :disabled="!canFitModel" @click="fitModel">Fit model</button>
      <action-required-message :message="actionRequiredMessage"></action-required-message>
      <run-model-plot :fade-plot="!!updateMsg" :model-fit="true"></run-model-plot>
      <div v-if="iterations">
        <vue-feather v-if="converged" class="inline-icon text-success" type="check"></vue-feather>
        <loading-spinner v-if="fitting" size="xs"></loading-spinner>
        Iterations: {{iterations}}  Sum of squares: {{sumOfSquares}}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import VueFeather from "vue-feather";
import RunModelPlot from "../run/RunModelPlot.vue";
import ActionRequiredMessage from "../ActionRequiredMessage.vue";
import { ModelFitAction } from "../../store/modelFit/actions";
import {ModelFitGetter} from "../../store/modelFit/getters";
import userMessages from "../../userMessages";
import LoadingSpinner from "../LoadingSpinner.vue";

export default {
    name: "FitTab",
    components: {
      LoadingSpinner,
      RunModelPlot,
      ActionRequiredMessage,
      VueFeather
    },
    setup() {
        const store = useStore();
        const namespace = "modelFit";

        const canFitModel = computed(() => store.getters[`${namespace}/${ModelFitGetter.canRunFit}`]);
        const fitModel = () => store.dispatch(`${namespace}/${ModelFitAction.FitModel}`);
        const iterations = computed(() => store.state.modelFit.iterations);
        const converged = computed(() => store.state.modelFit.converged);
        const fitting = computed(() => store.state.modelFit.fitting);
        const sumOfSquares = computed(() => store.state.modelFit.sumOfSquares);
        const actionRequiredMessage = computed(() => canFitModel.value ? "" : userMessages.modelFit.cannotFit);

        return {
            canFitModel,
            fitModel,
            iterations,
            converged,
            fitting,
            sumOfSquares,
            actionRequiredMessage
        };
    }
};
</script>
