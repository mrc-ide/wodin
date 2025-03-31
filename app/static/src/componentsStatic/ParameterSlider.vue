<template>
  <label :id="`${name}-input`" class="col-form-label fw-bold pb-0 label">{{ name }}</label>
  <div :id="`${name}-description`" class="description">
    {{ description }}
  </div>
  <div :id="`${name}-value`" class="float-end value mt-2">
    {{ value }}
  </div>
  <input type="range" class="form-range" :min="min" :max="max" :step="step || (max - min) / 10000" :value="value" @input="handleChange"/>
</template>

<script setup lang="ts">
import { AppState } from '@/store/appState/state';
import { RunAction } from '@/store/run/actions';
import { RunMutation } from '@/store/run/mutations';
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore<AppState>();

const props = defineProps({
  name: { type: String, required: true },
  description: { type: String, required: false },
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  step: { type: Number }
});

const value = computed(() => store.state.run.parameterValues![props.name]);

const handleChange = (e: Event) => {
  const newVal = (e.target as HTMLInputElement).value;
  const oldParameterValues = store.state.run.parameterValues;
  const newParameterValues = { ...oldParameterValues, [props.name]: parseFloat(newVal) };
  store.commit(`run/${RunMutation.SetParameterValues}`, newParameterValues);
  store.dispatch(`run/${RunAction.RunModel}`);
};
</script>

<style lang="css" scoped>
.value {
  font-size: 0.8rem;
  color: grey;
}

.description {
  font-size: 0.85rem;
  color: rgb(82, 82, 82);
}

.label {
  font-size: 0.9rem;
}
</style>
