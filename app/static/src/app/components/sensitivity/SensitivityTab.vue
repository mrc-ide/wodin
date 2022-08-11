<template>
  <div class="sensitivity-tab">
    <div>
      <button class="btn btn-primary" id="run-sens-btn" :disabled="!canRunSensitivity" @click="runSensitivity">Run sensitivity</button>
    </div>
    <action-required-message :message="updateMsg"></action-required-message>
    <sensitivity-traces-plot :fade-plot="!!updateMsg" ></sensitivity-traces-plot>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import SensitivityTracesPlot from "./SensitivityTracesPlot.vue";
import ActionRequiredMessage from "../ActionRequiredMessage.vue";
import { RequiredModelAction } from "../../store/model/state";
import { SensitivityGetter } from "../../store/sensitivity/getters";
import { SensitivityAction } from "../../store/sensitivity/actions";
import userMessages from "../../userMessages";

export default defineComponent({
    name: "SensitivityTab",
    components: {
        ActionRequiredMessage,
        SensitivityTracesPlot
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

        const modelRequiredAction = computed(() => store.state.model.requiredAction);
        const sensitivityUpdateRequired = computed(() => store.state.sensitivity.sensitivityUpdateRequired);
        const updateMsg = computed(() => {
            if (store.state.sensitivity.batch?.solutions.length) {
                if (modelRequiredAction.value === RequiredModelAction.Compile) {
                    return userMessages.sensitivity.compileRequiredForUpdate;
                }
                if (sensitivityUpdateRequired.value) {
                    return userMessages.sensitivity.runRequiredForUpdate;
                }
            }
            return "";
        });

        return {
            canRunSensitivity,
            runSensitivity,
            updateMsg
        };
    }
});
</script>
