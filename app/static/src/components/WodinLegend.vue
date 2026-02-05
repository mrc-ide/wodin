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
      <p class="legend-text">{{ name }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';

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
</script>

<style lang="css" scoped>
.legend {
  display: flex;
  flex-direction: column;
  justify-content: start;
  width: min(20rem, 25%);
  max-height: calc(450px - 1rem);
  overflow: auto;
  scrollbar-color: grey transparent;
  scrollbar-width: thin;
}

.legend-row {
  display: grid;
  grid-template-columns: 30px 1fr;
  margin-inline: 0.4rem;
  padding-inline: 0.5rem;
  cursor: pointer;
  align-items: center;
  margin-block: 0.1rem;
}

.legend-text {
  font-size: 0.85rem;
  margin-bottom: 0;
  margin-left: 0.5rem;
}

.faded {
  opacity: 0.4;
}

svg {
  margin-right: 0.25rem;
}
</style>
