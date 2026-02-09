<template>
  <div class="legend">
    <div v-for="(config, name) in legendConfigs"
         :key="name"
         class="legend-row"
         :class="config.faded ? 'faded' : ''"
         @click="$emit('legendClick', name)">
      <svg  viewBox="0 0 30 10" height="10" width="30">
        <line v-if="config.type === 'line'" x1="0" x2="30" y1="5" y2="5"
              :stroke="config.color" stroke-width="2"/>
        <circle v-if="config.type === 'point'" cx="15" cy="5" r="2.5" :fill="config.color"/>
      </svg>
      <p class="legend-text" :style="{ width }">{{ name }}</p>
    </div>
    <div class="legend-row hidden-legend-row">
      <svg viewBox="0 0 30 10" height="10" width="30"></svg>
      <p class="legend-text" ref="hiddenLegendText"></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AppState, VisualisationTab } from '@/store/appState/state';
import { FitDataGetter } from '@/store/fitData/getters';
import { AllFitData } from '@/store/fitData/state';
import { computed, PropType, ref } from 'vue';
import { useStore } from 'vuex';

export type LegendConfig = {
  color: string,
  type: "line" | "point",
  faded: boolean
}

defineProps({
  legendConfigs: {
    required: true,
    type: Object as PropType<Record<string, LegendConfig>>
  }
});

defineEmits(["legendClick"]);

const store = useStore<AppState>();

const hiddenLegendText = ref<HTMLParagraphElement | undefined>();

const allFitData = computed(() => store.getters[`fitData/${FitDataGetter.allData}`] as AllFitData | null);

const width = computed(() => {
  if (!hiddenLegendText.value) return 0;

  // get all variables across all the graphs on screen + fit linked variables
  const graphConfigs = store.state.openVisualisationTab === VisualisationTab.Fit
    ? [store.state.graphs.fitGraphConfig]
    : store.state.graphs.config;
  const legendLabels: string[] = [];
  graphConfigs.forEach(cfg => {
    cfg.selectedVariables.forEach(variable => {
      if (legendLabels.includes(variable)) return;
      legendLabels.push(variable);
    });
  });

  if (allFitData.value) {
    Object.keys(allFitData.value.linkedVariables).forEach(variable => {
      if (legendLabels.includes(variable)) return;
      legendLabels.push(variable);
    });
  }


  // get width from hidden tag mounted in DOM to determine the max width
  // of a legend label
  let maxWidth = 0;
  legendLabels.forEach(label => {
    hiddenLegendText.value!.textContent = label;
    const { width } = hiddenLegendText.value!.getBoundingClientRect();
    if (width > maxWidth) maxWidth = width;
  });


  return `${Math.ceil(maxWidth)}px`;
});
</script>

<style lang="css">
.legend {
  display: flex;
  flex-direction: column;
  justify-content: start;
  max-width: 25%;
  max-height: calc(450px - 1rem);
  overflow: auto;
  scrollbar-color: grey transparent;
  scrollbar-width: thin;
  margin-top: 0.6rem;
}

.legend-row, .hidden-legend-row {
  display: grid;
  grid-template-columns: 30px 1fr;
  margin-inline: 0.4rem;
  padding-inline: 0.5rem;
  cursor: pointer;
  align-items: center;
  margin-block: 0.1rem;
}

.hidden-legend-row {
  pointer-events: none;
  visibility: hidden;
  position:absolute;
}

.legend-text {
  font-size: 0.85rem;
  margin-bottom: 0;
  margin-left: 0.5rem;
}

.faded {
  opacity: 0.4;
}

.legend-row svg {
  margin-right: 0.25rem;
}
</style>
