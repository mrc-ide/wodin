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
import {
    odinToPlotly, allFitDataToPlotly, WodinPlotData, filterSeriesSet
} from "../../plot";
import WodinPlot from "../WodinPlot.vue";
import { OdinRunResultOde } from "../../types/wrapperTypes";
import { RunGetter } from "../../store/run/getters";
import { OdinSolution } from "../../types/responseTypes";
import { Dict } from "../../types/utilTypes";
import { runPlaceholderMessage } from "../../utils";

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

        const solution = computed(() => (store.state.run.resultOde?.solution));
        const parameterSetSolutions = computed(() => {
            const result = {} as Dict<OdinSolution>;
            Object.keys(store.state.run.parameterSetResults).forEach((name) => {
                const sln = store.state.run.parameterSetResults[name].solution;
                if (sln) {
                    result[name] = sln;
                }
            });
            return result;
        });

        const endTime = computed(() => store.state.run.endTime);

        const palette = computed(() => store.state.model.paletteModel);

        const allFitData = computed(() => store.getters[`fitData/${FitDataGetter.allData}`]);

        const selectedVariables = computed(() => store.state.model.selectedVariables);
        const placeholderMessage = computed(() => runPlaceholderMessage(selectedVariables.value, false));

        const allPlotData = (start: number, end: number, points: number): WodinPlotData => {
            const options = {
                mode: "grid", tStart: start, tEnd: end, nPoints: points
            };
            const result = solution.value && solution.value(options);
            if (!result) {
                return [];
            }

            const allData = [
                ...odinToPlotly(filterSeriesSet(result, selectedVariables.value), palette.value),
                ...allFitDataToPlotly(allFitData.value, palette.value, start, end)
            ];

            const lineStylesForParameterSets = store.getters[`run/${RunGetter.lineStylesForParameterSets}`];
            Object.keys(parameterSetSolutions.value).forEach((name) => {
                const paramSetSln = parameterSetSolutions.value[name];
                const paramSetResult = paramSetSln!(options as any);

                const dash = lineStylesForParameterSets[name];
                if (paramSetResult) {
                    const filteredSetData = filterSeriesSet(paramSetResult, selectedVariables.value);
                    allData.push(...odinToPlotly(filteredSetData, palette.value, { dash, showLegend: false }));
                }
            });
            return allData;
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
