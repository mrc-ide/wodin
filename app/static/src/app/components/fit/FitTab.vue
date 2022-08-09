<template>
  <div class="fit-tab">
    <div>
      <button class="btn btn-primary me-2" id="fit-btn" :disabled="!canFitModel" @click="fitModel">Fit model</button>
      <button class="btn btn-outline" id="cancel-fit-btn" :disabled="!fitting" @click="cancelFit">Cancel fit</button>
      <action-required-message :message="actionRequiredMessage"></action-required-message>
      <fit-plot :fade-plot="!!actionRequiredMessage" :model-fit="true">
        <div v-if="iterations">
          <vue-feather v-if="iconType"
                       class="inline-icon"
                       :class="iconClass"
                       :type="iconType"
                       size="40px"></vue-feather>
          <loading-spinner v-if="fitting" class="inline-icon" size="xs"></loading-spinner>
          <span class="ms-2">Iterations: {{iterations}}</span>
          <span class="ms-2">Sum of squares: {{sumOfSquares}}</span>
          <div v-if="cancelled" id="fit-cancelled-msg" class="small text-danger">{{cancelledMsg}}</div>
        </div>
      </fit-plot>
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import VueFeather from "vue-feather";
import FitPlot from "./FitPlot.vue";
import ActionRequiredMessage from "../ActionRequiredMessage.vue";
import { ModelFitAction } from "../../store/modelFit/actions";
import { ModelFitGetter } from "../../store/modelFit/getters";
import userMessages from "../../userMessages";
import LoadingSpinner from "../LoadingSpinner.vue";
import { RequiredModelAction } from "../../store/model/state";
import { ModelFitMutation } from "../../store/modelFit/mutations";

export default {
    name: "FitTab",
    components: {
        LoadingSpinner,
        FitPlot,
        ActionRequiredMessage,
        VueFeather
    },
    setup() {
        const store = useStore();
        const namespace = "modelFit";

        const canFitModel = computed(() => store.getters[`${namespace}/${ModelFitGetter.canRunFit}`]);
        const compileRequired = computed(() => store.state.model.requiredAction === RequiredModelAction.Compile);
        const fitUpdateRequired = computed(() => store.state.modelFit.fitUpdateRequired);
        const fitModel = () => store.dispatch(`${namespace}/${ModelFitAction.FitModel}`);
        const cancelFit = () => store.commit(`${namespace}/${ModelFitMutation.SetFitting}`, false);

        const iterations = computed(() => store.state.modelFit.iterations);
        const converged = computed(() => store.state.modelFit.converged);
        const fitting = computed(() => store.state.modelFit.fitting);
        const cancelled = computed(() => iterations.value && !fitting.value && !converged.value);
        const sumOfSquares = computed(() => store.state.modelFit.sumOfSquares);

        const actionRequiredMessage = computed(() => {
            if (!canFitModel.value) {
                return userMessages.modelFit.cannotFit;
            }
            if (compileRequired.value) {
                return userMessages.modelFit.compileRequired;
            }
            if (fitUpdateRequired.value) {
                return userMessages.modelFit.fitRequired;
            }

            return "";
        });

        const cancelledMsg = computed(() => (cancelled.value ? userMessages.modelFit.cancelled : ""));
        const iconType = computed(() => {
            if (cancelled.value) {
                return "alert-circle";
            }
            if (converged.value) {
                return "check";
            }
            return null;
        });
        const iconClass = computed(() => {
            const classes = {
                "alert-circle": "text-secondary",
                check: "text-success"
            };
            return iconType.value ? classes[iconType.value] : null;
        });

        return {
            canFitModel,
            fitModel,
            cancelFit,
            iterations,
            converged,
            fitting,
            cancelled,
            cancelledMsg,
            sumOfSquares,
            actionRequiredMessage,
            iconType,
            iconClass
        };
    }
};
</script>
