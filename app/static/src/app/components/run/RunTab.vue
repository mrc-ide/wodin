<template>
  <div>
    <button class="btn btn-primary" :disabled="!canRunModel" @click="runModel">Run model</button>
  </div>
  <run-model-plot></run-model-plot>
  <div class="text-danger">{{updateMsg}}</div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { computed } from "vue";
import RunModelPlot from "./RunModelPlot.vue";
import { ModelAction } from "../../store/model/actions";
import { ModelUpdateType } from "../../store/model/state";

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
            const { lastUpdate } = store.state.model;
            if (lastUpdate === ModelUpdateType.CodeUpdated) {
                return "Code has been updated. Compile code and Run Model to view graph for latest code.";
            }

            if (lastUpdate === ModelUpdateType.Compiled) {
                return "Code has been recompiled. Run Model to view graph for latest code.";
            }

            return null;
        });

        return {
            canRunModel,
            updateMsg,
            runModel
        };
    }
};
</script>
