<template>
    <wodin-plot
        :fade-plot="fadePlot"
        :placeholder-message="placeholderMessage"
        :end-time="endTime"
        :plot-data="allPlotData"
        :solutions="solution ? [solution] : []">
        <slot></slot>
    </wodin-plot>
</template>

<script lang="ts">
import {
    computed, defineComponent
} from "vue";
import { useStore } from "vuex";
import { FitDataGetter } from "../../store/fitData/getters";
import userMessages from "../../userMessages";
import { Dict } from "../../types/utilTypes";
import { filterSeriesSet, odinToPlotly, WodinPlotData } from "../../plot";
import WodinPlot from "../WodinPlot.vue";

export default defineComponent({
    name: "FitPlot",
    components: { WodinPlot },
    props: {
        fadePlot: Boolean
    },
    setup() {
        const store = useStore();

        const placeholderMessage = userMessages.modelFit.notFittedYet;

        const solution = computed(() => store.state.modelFit.solution);

        const endTime = computed(() => store.getters[`fitData/${FitDataGetter.dataEnd}`]);

        const palette = computed(() => store.state.model.paletteModel);

        const seriesColour = (variable: string) => ({ color: palette.value[variable] });

        const fitDataSeries = (start: number, end: number): WodinPlotData => {
            const { fitData } = store.state;
            const timeVar = fitData?.timeVariable;
            const dataVar = fitData?.columnToFit;
            if (fitData.data && dataVar && timeVar) {
                const filteredData = fitData.data.filter(
                    (row: Dict<number>) => row[timeVar] >= start && row[timeVar] <= end
                );
                const modelVar = fitData.linkedVariables[dataVar];
                return [{
                    name: dataVar,
                    x: filteredData.map((row: Dict<number>) => row[timeVar]),
                    y: filteredData.map((row: Dict<number>) => row[dataVar]),
                    mode: "markers",
                    type: "scatter",
                    marker: seriesColour(modelVar)
                }];
            }
            return [];
        };

        const allPlotData = (start: number, end: number, points: number): WodinPlotData => {
            const result = solution.value && solution.value(start, end, points);
            if (!result) {
                return [];
            }
            const { fitData } = store.state;
            const dataVar = fitData?.columnToFit;
            const modelVar = fitData.linkedVariables[dataVar];
            return [...odinToPlotly(filterSeriesSet(result, modelVar), palette.value), ...fitDataSeries(start, end)];
        };

        return {
            placeholderMessage,
            solution,
            endTime,
            allPlotData
        };
    }
});
</script>
