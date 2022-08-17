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

        const error = computed(() => store.state.model.odinRunnerError);

        // Enable run button if model has initialised and compile is not required
        const canRunModel = computed(() => !!store.state.model.odinRunner && !!store.state.model.odin
            && !store.state.model.compileRequired);

        const runModel = () => store.dispatch(`model/${ModelAction.RunModel}`);
        const updateMsg = computed(() => {
            if (store.state.model.compileRequired) {
                return userMessages.run.compileRequired;
            }
            if (store.state.model.runRequired) {
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
