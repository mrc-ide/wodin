<template>
  <div class="run-tab">
    <div>
      <button class="btn btn-primary" id="run-btn" :disabled="!canRunModel" @click="runModel">Run model</button>
    </div>
    <div class="run-update-msg text-danger text-center">{{updateMsg}}</div>
    <run-model-plot :fade-plot="!!updateMsg"></run-model-plot>
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { computed, defineComponent } from "vue";
import RunModelPlot from "./RunModelPlot.vue";
import { ModelAction } from "../../store/model/actions";
import { RequiredModelAction } from "../../store/model/state";

export default defineComponent({
    name: "RunTab",
    components: {
        RunModelPlot
    },
    setup() {
        const store = useStore();

        const requiredAction = computed(() => store.state.model.requiredACtion);

        // Enable run button if model has initialised and compile is not required
        const canRunModel = computed(() => !!store.state.model.odinRunner && !!store.state.model.odin && requiredAction.value !== RequiredModelAction.Compile);

        const runModel = () => store.dispatch(`model/${ModelAction.RunModel}`);
        const updateCodeMsg = computed(() => {
            if (requiredAction.value === RequiredModelAction.Compile) {
                return "Model code has been updated. Compile code and Run Model to view updated graph.";
            }
            if (requiredAction.value === RequiredModelAction.Run) {
                return "Model code has been recompiled or parameters have been updated. Run Model to view updated graph.";
            }
            return "";
        });

        return {
            canRunModel,
            updateCodeMsg,
            runModel
        };
    }
});
</script>
<style scoped lang="scss">
  .run-update-msg {
    min-height:1.5rem;
  }
</style>
