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
import {WodinPlotData, discreteSeriesSetToPlotly, filterSeriesSet} from "../../plot";
import WodinPlot from "../WodinPlot.vue";
import {runPlaceholderMessage} from "../../utils";

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
            return discreteSeriesSetToPlotly(filterSeriesSet(result, selectedVariables.value), palette.value);
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
