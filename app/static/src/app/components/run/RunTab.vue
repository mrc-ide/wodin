<template>
  <div class="run-tab">
    <div>
      <button class="btn btn-primary" id="run-btn" :disabled="!canRunModel" @click="runModel">Run model</button>
    </div>
    <div class="run-update-msg text-danger text-center">
      <span v-if="updateMsg" class="p-1">{{updateMsg}}</span>
    </div>
    <run-model-plot :fade-plot="!!updateMsg"></run-model-plot>
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { computed, defineComponent } from "vue";
import RunModelPlot from "./RunModelPlot.vue";
import { ModelAction } from "../../store/model/actions";
import { RequiredModelAction } from "../../store/model/state";
import userMessages from "../../userMessages";

export default defineComponent({
    name: "RunTab",
    components: {
        RunModelPlot
    },
    setup() {
        const store = useStore();

        const requiredAction = computed(() => store.state.model.requiredAction);

        // Enable run button if model has initialised and compile is not required
        const canRunModel = computed(() => !!store.state.model.odinRunner && !!store.state.model.odin && requiredAction.value !== RequiredModelAction.Compile);

        const runModel = () => store.dispatch(`model/${ModelAction.RunModel}`);
        const updateMsg = computed(() => {
            if (requiredAction.value === RequiredModelAction.Compile) {
                return userMessages.run.compileRequired;
            }
            if (requiredAction.value === RequiredModelAction.Run) {
                return userMessages.run.runRequired;
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
    min-height:1.6rem;
    span {
      border: 1px solid #dee2e6;
    }
  }
</style>
