<template>
  <div class="container">
    <div class="row my-2">
      <div class="col-5">
        <label class="col-form-label">End time</label>
      </div>
      <div class="col-6">
        <numeric-input :value="endTime"
                       :allow-negative="false"
                       @update="updateEndTime"></numeric-input>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { RunMutation } from "../../store/run/mutations";
import { SensitivityMutation } from "../../store/sensitivity/mutations";
import NumericInput from "./NumericInput.vue";

export default defineComponent({
    name: "RunOptions",
    components: {
        NumericInput
    },
    setup() {
        const store = useStore();
        const endTime = computed(() => store.state.run.endTime);

        const updateEndTime = (newValue: number) => {
            store.commit(`run/${RunMutation.SetEndTime}`, newValue);
            store.commit(`sensitivity/${SensitivityMutation.SetUpdateRequired}`, true);
        };

        return {
            endTime,
            updateEndTime
        };
    }
});
</script>
