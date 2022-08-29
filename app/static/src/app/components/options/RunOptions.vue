<template>
  <div class="container">
    <div class="row my-2">
      <div class="col-5">
        <label class="col-form-label">End time</label>
      </div>
      <div class="col-6">
        <numeric-input
                       v-if="endTimeData === 0"
                       :value="endTime"
                       :allow-negative="false"
                       @update="updateEndTime"></numeric-input>
        <label v-if="endTimeData > 0" class="col-form-label">{{ endTimeData }} (from data)</label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { RunMutation } from "../../store/run/mutations";
import { SensitivityMutation } from "../../store/sensitivity/mutations";
import { FitDataGetter } from "../../store/fitData/getters";
import NumericInput from "./NumericInput.vue";

export default defineComponent({
    name: "RunOptions",
    components: {
        NumericInput
    },
    setup() {
        const store = useStore();
        const endTimeData = computed(() => store.getters[`fitData/${FitDataGetter.dataEnd}`]);
        const endTime = computed(() => store.state.run.endTime);

        const updateEndTime = (newValue: number) => {
            store.commit(`run/${RunMutation.SetEndTime}`, newValue);
            store.commit(`sensitivity/${SensitivityMutation.SetUpdateRequired}`, true);
        };

        return {
            endTime,
            endTimeData,
            updateEndTime
        };
    }
});
</script>
