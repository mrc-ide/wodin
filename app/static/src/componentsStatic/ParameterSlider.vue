<template>
  <div class="slider">
    <div style="width: 100%;">
      <label class="col-form-label fw-bold pb-0 label" ref="labelRef"></label>
      <div class="desc" ref="descRef"></div>
    </div>
    <div style="width: 100%;">
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
import { RunAction } from '@/store/run/actions';
import { RunMutation } from '@/store/run/mutations';
import { computed, onMounted, ref } from 'vue';
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
  store.dispatch(`run/${RunAction.RunModel}`);
};

const labelRef = ref<HTMLLabelElement | null>(null);
const descRef = ref<HTMLDivElement | null>(null);

onMounted(async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { MathJax } = window as any;
  if (!labelRef.value || !descRef.value || !MathJax) return;

  labelRef.value.innerHTML = props.title || props.par;
  descRef.value.innerHTML = props.desc || "";

  await MathJax.typesetPromise();
});
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
