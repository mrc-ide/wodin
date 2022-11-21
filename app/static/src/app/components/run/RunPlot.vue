<template>
  <wodin-plot
      :fade-plot="fadePlot"
      :placeholder-message="placeholderMessage"
      :end-time="endTime"
      :plot-data="allPlotData"
      :redrawWatches="solution ? [solution, allFitData, selectedVariables] : []">
    <slot></slot>
  </wodin-plot>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { FitDataGetter } from "../../store/fitData/getters";
import userMessages from "../../userMessages";
import {
    odinToPlotly, allFitDataToPlotly, WodinPlotData, filterSeriesSet
} from "../../plot";
import WodinPlot from "../WodinPlot.vue";

export default defineComponent({
    name: "RunPlot",
    props: {
        fadePlot: Boolean
    },
    components: {
        WodinPlot
    },
    setup() {
        const store = useStore();

        const placeholderMessage = userMessages.run.notRunYet;

        const solution = computed(() => (store.state.run.resultOde?.solution));

        const endTime = computed(() => store.state.run.endTime);

        const palette = computed(() => store.state.model.paletteModel);

        const allFitData = computed(() => store.getters[`fitData/${FitDataGetter.allData}`]);

        const selectedVariables = computed(() => store.state.model.selectedVariables);

        const allPlotData = (start: number, end: number, points: number): WodinPlotData => {
            const result = solution.value && solution.value({
                mode: "grid", tStart: start, tEnd: end, nPoints: points
            });
            if (!result) {
                return [];
            }
            return [
                ...odinToPlotly(filterSeriesSet(result, selectedVariables.value), palette.value),
                ...allFitDataToPlotly(allFitData.value, palette.value, start, end)
            ];
        };

        return {
            placeholderMessage,
            endTime,
            solution,
            allFitData,
            allPlotData,
            selectedVariables
        };
    }
});
</script>
