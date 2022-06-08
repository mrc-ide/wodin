<template>
  <div>
    <button class="btn btn-primary" :disabled="!canRunModel" @click="runModel">Run model</button>
  </div>
  <div class="text-danger text-center" style="min-height:1.5rem;">{{updateMsg}}</div>
  <run-model-plot :fade-plot="!!updateMsg"></run-model-plot>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { computed } from "vue";
import RunModelPlot from "./RunModelPlot.vue";
import { ModelAction } from "../../store/model/actions";
import { RequiredModelAction } from "../../store/model/state";

export default {
    name: "RunTab",
    components: {
        RunModelPlot
    },
    setup() {
        const store = useStore();
        const canRunModel = computed(() => !!store.state.model.odinRunner);

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
};
</script>
