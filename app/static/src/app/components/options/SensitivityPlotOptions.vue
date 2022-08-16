<template>
  <div class="container mb-4">
    <div class="row mb-2" id="sensitivity-plot-type" >
      <div class="col-5">
        <label class="col-form-label">Type of plot</label>
      </div>
      <div class="col-6">
        <select class="form-select" v-model="plotType">
          <option value="TraceOverTime">Trace over time</option>
          <option value="ValueAtTime">Value at a single time</option>
          <option value="ValueAtExtreme">Value at its min/max</option>
          <option value="TimeAtExtreme">Time at value's min/max</option>
        </select>
      </div>
    </div>
    <div v-if="extremePlotType" id="sensitivity-plot-extreme"  class="row mb-2">
      <div class="col-5">
        <label class="col-form-label">Min/Max</label>
      </div>
      <div class="col-6">
        <select class="form-select" v-model="extreme">
          <option v-for="extremeValue in extremeValues" :key="extremeValue">{{extremeValue}}</option>
        </select>
      </div>
    </div>
    <div v-if="timePlotType" id="sensitivity-plot-time" class="row mb-2">
      <div class="col-5">
        <label class="col-form-label">Time to use</label>
      </div>
      <div class="col-6">
        <input v-model="time" class="form-control" type="number">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import { SensitivityMutation } from "../../store/sensitivity/mutations";
import { SensitivityPlotExtreme, SensitivityPlotType } from "../../store/sensitivity/state";

export default defineComponent({
    name: "SensitivityPlotOptions.vue",
    setup() {
        const namespace = "sensitivity";
        const store = useStore();

        const settings = computed(() => store.state.sensitivity.plotSettings);
        const modelEndTime = computed(() => store.state.model.endTime);

        const plotType = computed({
            get: () => settings.value.plotType,
            set: (newVal) => store.commit(`${namespace}/${SensitivityMutation.SetPlotType}`, newVal)
        });

        const extreme = computed({
            get: () => settings.value.extreme,
            set: (newVal) => store.commit(`${namespace}/${SensitivityMutation.SetPlotExtreme}`, newVal)
        });

        const time = computed({
            get: () => settings.value.time,
            set: (newVal) => {
                // we let the user set any numeric value here, but will clip to 0 to endTime range when get data
                store.commit(`${namespace}/${SensitivityMutation.SetPlotTime}`, newVal);
            }
        });

        const extremePlotType = computed(
            () => [SensitivityPlotType.TimeAtExtreme, SensitivityPlotType.ValueAtExtreme].includes(plotType.value)
        );
        const timePlotType = computed(() => plotType.value === SensitivityPlotType.ValueAtTime);

        const extremeValues = Object.keys(SensitivityPlotExtreme);

        onMounted(() => {
        // if plot settings time has not been initialised, set to model end time
            if (store.state.sensitivity.plotSettings.time === null) {
                time.value = modelEndTime.value;
            }
        });

        return {
            extremePlotType,
            timePlotType,
            extremeValues,
            plotType,
            extreme,
            time
        };
    }
});
</script>
