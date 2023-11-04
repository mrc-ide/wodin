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
import { WodinPlotData, discreteSeriesSetToPlotly, filterSeriesSet } from "../../plot";
import WodinPlot from "../plot/WodinPlot.vue";
import { runPlaceholderMessage } from "../../utils";
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

        const selectedVariables = computed(() => store.state.model.selectedVariables);
        const placeholderMessage = computed(() => runPlaceholderMessage(selectedVariables.value, false));

        const solution = computed(() => (store.state.run.resultDiscrete?.solution));

        const endTime = computed(() => store.state.run.endTime);

        const palette = computed(() => store.state.model.paletteModel);

        const allPlotData = (start: number, end: number, points: number): WodinPlotData => {
            const result = solution.value && solution.value({
                mode: "grid", tStart: start, tEnd: end, nPoints: points
            });
            if (!result) {
                return [];
            }
            const replicates = store.state.run.numberOfReplicates;
            const maxReplicatesDisplay = (store.state.config as StochasticConfig)?.maxReplicatesDisplay;
            const showIndividualTraces = replicates <= maxReplicatesDisplay;

            return discreteSeriesSetToPlotly(
                filterSeriesSet(result, selectedVariables.value),
                palette.value,
                showIndividualTraces
            );
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
