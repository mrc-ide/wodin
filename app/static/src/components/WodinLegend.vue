<template>
  <div class="legend">
    <div v-for="(config, name) in legendConfigs"
         :key="name"
         class="legend-row"
         :class="config.enabled ? '' : 'faded'"
         @click="$emit('legendClick', name)">
      <svg v-if="config.type === 'line'" viewBox="0 0 30 10" height="10" width="30">
        <line x1="0" x2="30" y1="5" y2="5"
              :stroke="config.color" stroke-width="3"/>
      </svg>
      <svg v-if="config.type === 'point'" viewBox="0 0 10 10" height="10" width="10">
        <circle cx="5" cy="5" r="4" :fill="config.color"/>
      </svg>
      {{ name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';

export type LegendConfig = {
  color: string,
  type: "line" | "point",
  enabled: boolean
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
  justify-content: center;
}

.legend-row {
  margin-inline: 0.4rem;
  padding-inline: 0.5rem;
  border-radius: 5px;
  cursor: pointer;
}

.faded {
  opacity: 0.4;
}

svg {
  margin-right: 0.25rem;
}
</style>
