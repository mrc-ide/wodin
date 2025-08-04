<template>
  <div class="slider">
    <div>
      <label class="col-form-label fw-bold pb-0 label">{{ title || par }}</label>
      <div class="desc">{{ desc }}</div>
    </div>
    <div>
      <div class="float-end value mt-2">
        {{ value }}
      </div>
      <input type="range"
             class="form-range"
             :min="min"
             :max="max"
             :step="step || (max - min) / 10000"
             :value="value"
             @input="handleChange"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AppState } from '@/store/appState/state';
import { RunMutation } from '@/store/run/mutations';
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore<AppState>();

const props = defineProps({
  par: { type: String, required: true },
  title: { type: String, required: false },
  desc: { type: String, required: false },
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  step: { type: Number, required: false }
});

const value = computed(() => store.state.run.parameterValues![props.par]);

const handleChange = (e: Event) => {
  const newVal = (e.target as HTMLInputElement).value;
  const oldParameterValues = store.state.run.parameterValues;
  const newParameterValues = { ...oldParameterValues, [props.par]: parseFloat(newVal) };
  store.commit(`run/${RunMutation.SetParameterValues}`, newParameterValues);
};
</script>

<style lang="css" scoped>
.value {
  font-size: 0.8rem;
  color: grey;
}

.desc {
  font-size: 0.85rem;
  color: rgb(82, 82, 82);
}

.label {
  font-size: 0.9rem;
}

.slider {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
