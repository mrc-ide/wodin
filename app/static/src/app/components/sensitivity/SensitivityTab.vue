<template>
  <div class="sensitivity-tab">
    <div>
      <button class="btn btn-primary" id="run-sens-btn" :disabled="!canRunSensitivity" @click="runSensitivity">Run sensitivity</button>
    </div>
    <sensitivity-plot></sensitivity-plot>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import SensitivityPlot from "./SensitivityPlot.vue";
import { RequiredModelAction } from "../../store/model/state";
import { SensitivityGetter } from "../../store/sensitivity/getters";
import {SensitivityAction} from "../../store/sensitivity/actions";

export default defineComponent({
    name: "SensitivityTab",
    components: {
        SensitivityPlot
    },
    setup() {
        const store = useStore();
        const canRunSensitivity = computed(() => {
            return !!store.state.model.odinRunner && !!store.state.model.odin
            && store.state.model.requiredAction !== RequiredModelAction.Compile
            && !!store.getters[`sensitivity/${SensitivityGetter.batchPars}`];
        });

        const runSensitivity = () => {
          store.dispatch(`sensitivity/${SensitivityAction.RunSensitivity}`);
        };

        return {
          canRunSensitivity,
          runSensitivity
        };
    }
});
</script>
