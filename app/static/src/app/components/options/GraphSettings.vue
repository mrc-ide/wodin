<template>
  <div class="container">
    <div id="log-scale-y-axis" class="row my-2">
      <div class="col-5">
        <label class="col-form-label">Log scale y axis</label>
      </div>
      <div class="col-6">
        <input type="checkbox" class="form-check-input" style="vertical-align:bottom;" v-model="logScaleYAxis">
      </div>
    </div>
    <div id="lock-y-axis" class="row my-2">
      <div class="col-5">
        <label class="col-form-label">Lock Y Axis</label>
      </div>
      <div class="col-6">
        <input type="checkbox" class="form-check-input" style="vertical-align:bottom;" v-model="lockYAxis">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { GraphSettingsMutation } from "../../store/graphSettings/mutations";

export default defineComponent({
    name: "GraphSettings",
    setup() {
        const store = useStore();
        const logScaleYAxis = computed({
            get() {
                return store.state.graphSettings.logScaleYAxis;
            },
            set(newValue) {
                store.commit(`graphSettings/${GraphSettingsMutation.SetLogScaleYAxis}`, newValue);
            }
        });

        const lockYAxis = computed({
            get() {
                return store.state.graphSettings.lockYAxis;
            },
            set(newValue) {
                store.commit(`graphSettings/${GraphSettingsMutation.SetLockYAxis}`, newValue);
            }
        });

        return {
            logScaleYAxis,
            lockYAxis
        };
    }
});
</script>
