<template>
  <div class="fit-tab">
    <div>
      <button class="btn btn-primary" id="fit-btn" :disabled="!canFitModel" @click="fitModel">Fit model</button>
      <run-model-plot :fade-plot="!!updateMsg" :model-fit="true"></run-model-plot>
      <div>Iterations: {{iterations}}  Sum of squares: {{sumOfSquares}}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import RunModelPlot from "../run/RunModelPlot.vue";
import { ModelFitAction } from "../../store/modelFit/actions";

export default {
    name: "FitTab",
    components: {
      RunModelPlot
    },
    setup() {
        const store = useStore();
        const namespace = "modelFit";

        // TODO: we can fit model when we have an Odin Solution, and data, and columnToFit, and a time variable
        const canFitModel = computed(() => true);
        const fitModel = () => store.dispatch(`${namespace}/${ModelFitAction.FitModel}`);
        const iterations = computed(() => store.state.modelFit.iterations);
        const sumOfSquares = computed(() => store.state.modelFit.sumOfSquares);

        return {
            canFitModel,
            fitModel,
            iterations,
            sumOfSquares
        };
    }
};
</script>
