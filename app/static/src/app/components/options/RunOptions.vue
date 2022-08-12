<template>
  <div class="container">
    <div class="row my-2">
      <div class="col-5">
        <label class="col-form-label">End time</label>
      </div>
      <div class="col-6">
        <input class="form-control parameter-input"
               type="number"
               min="1"
               :value="endTime"
               @input="updateEndTime"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { ModelMutation } from "../../store/model/mutations";
import { SensitivityMutation } from "../../store/sensitivity/mutations";

export default defineComponent({
    name: "RunOptions",
    setup() {
        const store = useStore();
        const endTime = computed(() => store.state.model.endTime);

        const updateEndTime = (e: Event) => {
            const newValue = parseFloat((e.target as HTMLInputElement).value);
            store.commit(`model/${ModelMutation.SetEndTime}`, newValue);
            store.commit(`sensitivity/${SensitivityMutation.SetUpdateRequired}`, true);
        };

        return {
            endTime,
            updateEndTime
        };
    }
});
</script>
