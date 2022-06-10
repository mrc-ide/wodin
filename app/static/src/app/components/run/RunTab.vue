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
        const canRunModel = computed(() => !!store.state.model.odinRunner && !!store.state.model.odin);

        const runModel = () => store.dispatch(`model/${ModelAction.RunModel}`);
        const updateMsg = computed(() => {
            const { requiredAction } = store.state.model;
            if (requiredAction === RequiredModelAction.Compile) {
                return "Code has been updated. Compile code and Run Model to view graph for latest code.";
            }
            if (requiredAction === RequiredModelAction.Run) {
                return "Code has been recompiled. Run Model to view graph for latest code.";
            }
            return "";
        });

        return {
            canRunModel,
            updateMsg,
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
