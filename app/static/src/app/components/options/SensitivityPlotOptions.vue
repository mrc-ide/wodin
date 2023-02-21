<template>
  <div class="container mb-4">
    <div class="row mb-3" id="sensitivity-plot-type" >
      <div class="col-11">
        <label class="col-form-label">Type of plot</label>
      </div>
      <div class="col-11">
        <select class="form-select" v-model="plotType">
          <option v-for="option in plotTypeOptions" :value="option.value" :key="option.value">{{option.label}}</option>
        </select>
      </div>
    </div>
    <div v-if="extremePlotType" id="sensitivity-plot-extreme"  class="row mb-2">
      <div class="col-xl-5 col-11">
        <label class="col-form-label">Min/Max</label>
      </div>
      <div class="col-xl-6 col-11">
        <select class="form-select" v-model="extreme">
          <option v-for="extremeValue in extremeValues" :key="extremeValue">{{extremeValue}}</option>
        </select>
      </div>
    </div>
    <div v-if="timePlotType" id="sensitivity-plot-time" class="row mb-2">
      <div class="col-xl-5 col-11">
        <label class="col-form-label">Time to use</label>
      </div>
      <div class="col-xl-6 col-11">
        <numeric-input  :value="time"
                        :min-allowed="0"
                        @update="(n) => time = n"></numeric-input>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import { SensitivityMutation } from "../../store/sensitivity/mutations";
import { SensitivityPlotExtreme, SensitivityPlotType } from "../../store/sensitivity/state";
import NumericInput from "./NumericInput.vue";

export default defineComponent({
    name: "SensitivityPlotOptions.vue",
    components: {
        NumericInput
    },
    setup() {
        const namespace = "sensitivity";
        const store = useStore();

        const settings = computed(() => store.state.sensitivity.plotSettings);
        const modelEndTime = computed(() => store.state.run.endTime);

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

        const plotTypeOptions = [
            { value: SensitivityPlotType.TraceOverTime, label: "Trace over time" },
            { value: SensitivityPlotType.ValueAtTime, label: "Value at a single time" },
            { value: SensitivityPlotType.ValueAtExtreme, label: "Value at its min/max" },
            { value: SensitivityPlotType.TimeAtExtreme, label: "Time at value's min/max" }
        ];

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
            time,
            plotTypeOptions
        };
    }
});
</script>
