<template>
  <div class="sensitivity-tab">
    <div>
      <button class="btn btn-primary" id="run-sens-btn" :disabled="!canRunSensitivity" @click="runSensitivity">Run sensitivity</button>
    </div>
    <sensitivity-plot></sensitivity-plot>
  </div>
</template>

<script lang="ts">
import SensitivityPlot from "./SensitivityPlot.vue";
import {computed, defineComponent} from "vue";
import {useStore} from "vuex";
import {RequiredModelAction} from "../../store/model/state";

export default defineComponent({
    name: "SensitivityTab",
    components: {
      SensitivityPlot
    },
    setup() {
      const store = useStore();
      const canRunSensitivity = computed(() => {
        return !!store.state.model.odinRunner && !!store.state.model.odin
            && store.state.model.requiredAction.value !== RequiredModelAction.Compile
            && store.getters[`sensitivity/${SensitivityGetter.}`]
      })
    }
});
</script>
