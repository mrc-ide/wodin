<template>
  <div class="multi-sensitivity-tab">
    <div>
      <loading-button class="btn btn-primary"
                      id="run-sens-btn"
                      :loading="running"
                      :is-disabled="!canRunMultiSensitivity"
                      @click="runMultiSensitivity">Run Multi-sensitivity</loading-button>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { SensitivityGetter } from "../../store/sensitivity/getters";
import sensitivityPrerequisites from "../mixins/sensitivityPrerequisites";
import { BaseSensitivityMutation } from "../../store/sensitivity/mutations";
import { MultiSensitivityAction } from "../../store/multiSensitivity/actions";
import LoadingButton from "../LoadingButton.vue";

export default defineComponent({
    name: "MultiSensitivityTab",
    components: {
        LoadingButton
    },
    setup() {
        const store = useStore();
        const namespace = "multiSensitivity";
        const { sensitivityPrerequisitesReady } = sensitivityPrerequisites(store);

        const running = computed(() => store.state.multiSensitivity.running);

        const canRunMultiSensitivity = computed(() => {
            return sensitivityPrerequisitesReady.value
            && !!store.getters[`${namespace}/${SensitivityGetter.batchPars}`];
        });

        const runMultiSensitivity = () => {
            setTimeout(() => {
                store.dispatch(`${namespace}/${MultiSensitivityAction.RunMultiSensitivity}`);
            }, 100);
        };

        return {
            running,
            canRunMultiSensitivity,
            runMultiSensitivity
        };
    }
});
</script>
