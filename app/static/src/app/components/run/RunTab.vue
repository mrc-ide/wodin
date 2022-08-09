<template>
    <div class="run-tab">
        <div>
            <button class="btn btn-primary" id="run-btn" :disabled="!canRunModel" @click="runModel">Run model</button>
        </div>
        <action-required-message :message="updateMsg"></action-required-message>
        <run-plot :fade-plot="!!updateMsg" :model-fit="false"></run-plot>
        <error-info :error="error"></error-info>
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { computed, defineComponent } from "vue";
import RunPlot from "./RunPlot.vue";
import ActionRequiredMessage from "../ActionRequiredMessage.vue";
import { ModelAction } from "../../store/model/actions";
import { RequiredModelAction } from "../../store/model/state";
import userMessages from "../../userMessages";
import ErrorInfo from "../ErrorInfo.vue";

export default defineComponent({
    name: "RunTab",
    components: {
        RunPlot,
        ErrorInfo,
        ActionRequiredMessage
    },
    setup() {
        const store = useStore();

        const requiredAction = computed(() => store.state.model.requiredAction);
        const error = computed(() => store.state.model.odinRunnerError);

        // Enable run button if model has initialised and compile is not required
        const canRunModel = computed(() => !!store.state.model.odinRunner && !!store.state.model.odin
            && requiredAction.value !== RequiredModelAction.Compile);

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
            runModel,
            error
        };
    }
});
</script>
