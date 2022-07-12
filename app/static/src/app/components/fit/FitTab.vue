<template>
  <div class="fit-tab">
    <div>
      <button class="btn btn-primary" id="fit-btn" :disabled="!canFitModel" @click="fitModel">Fit model</button>
      <div>Iterations: {{iterations}}  Sum of squares: {{sumOfSquares}}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import { ModelFitAction } from "../../store/modelFit/actions";

export default {
    name: "FitTab",
    setup() {
        const store = useStore();
        const namespace = "modelFit";

        // TODO: we can fit model when we have an Odin Solution, and data, and at least one linked variable, and a time variable
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
