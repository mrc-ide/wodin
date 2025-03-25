<template>
  <div>
    <label :id="`${name}-input`" class="col-form-label">{{ name }}</label>
  </div>
  <div :id="`${name}-description`">
    {{ description }}
  </div>
  <input type="range" class="form-range" :min="min" :max="max" :step="step || (max - min) / 10000" :value="value" @input="handleChange"/>
</template>

<script setup lang="ts">
import { AppState } from '@/store/appState/state';
import { RunMutation } from '@/store/run/mutations';
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore<AppState>();

const props = defineProps({
  name: { type: String, required: true },
  description: { type: String, required: true },
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
};
</script>
