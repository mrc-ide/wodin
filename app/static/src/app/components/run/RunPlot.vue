<template>
  <wodin-ode-plot
      :fade-plot="fadePlot"
      :placeholder-message="placeholderMessage"
      :end-time="endTime"
      :plot-data="allPlotData"
      :solutions="solution ? [solution] : []">
    <slot></slot>
  </wodin-ode-plot>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import userMessages from "../../userMessages";
import { odinToPlotly, WodinPlotData } from "../../plot";
import WodinOdePlot from "../WodinOdePlot.vue";

export default defineComponent({
    name: "RunPlot",
    props: {
        fadePlot: Boolean
    },
    components: {
        WodinOdePlot
    },
    setup() {
        const store = useStore();

        const placeholderMessage = userMessages.run.notRunYet;

        const solution = computed(() => (store.state.model.odinSolution));

        const endTime = computed(() => store.state.model.endTime);

        const palette = computed(() => store.state.model.paletteModel);

        const allPlotData = (start: number, end: number, points: number): WodinPlotData => {
            const result = solution.value && solution.value(start, end, points);
            if (!result) {
                return [];
            }
            return [...odinToPlotly(result, palette.value)];
        };

        return {
            placeholderMessage,
            endTime,
            solution,
            allPlotData
        };
    }
});
</script>
