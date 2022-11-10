<template>
  <wodin-plot
      :fade-plot="fadePlot"
      :placeholder-message="placeholderMessage"
      :end-time="endTime"
      :plot-data="allPlotData"
      :redrawWatches="solution ? [solution] : []">
    <slot></slot>
  </wodin-plot>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import userMessages from "../../userMessages";
import { WodinPlotData, discreteSeriesSetToPlotly } from "../../plot";
import WodinPlot from "../WodinPlot.vue";
import { StochasticConfig } from "../../types/responseTypes";

export default defineComponent({
    name: "RunStochasticPlot",
    props: {
        fadePlot: Boolean
    },
    components: {
        WodinPlot
    },
    setup() {
        const store = useStore();

        const placeholderMessage = userMessages.run.notRunYet;

        const solution = computed(() => (store.state.run.resultDiscrete?.solution));

        const endTime = computed(() => store.state.run.endTime);

        const palette = computed(() => store.state.model.paletteModel);

        const displayIndividual = computed(() => {
            const maxReplicatesDisplay = (store.state.config as StochasticConfig).maxReplicatesDisplay || 50;
            const numberOfReplicates = store.state.run.resultDiscrete?.inputs.numberOfReplicates;
            return numberOfReplicates && numberOfReplicates <= maxReplicatesDisplay;
        };

        const allPlotData = (start: number, end: number, points: number): WodinPlotData => {
            const result = solution.value && solution.value({
                mode: "grid", tStart: start, tEnd: end, nPoints: points
            });
            if (!result) {
                return [];
            }
            return discreteSeriesSetToPlotly(result, palette.value, displayIndividual.value);
        };

        return {
            placeholderMessage,
            endTime,
            allPlotData,
            solution
        };
    }
});
</script>
