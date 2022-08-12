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
import {
    computed, defineComponent
} from "vue";
import { useStore } from "vuex";
import { FitDataGetter } from "../../store/fitData/getters";
import type { FitData, FitDataLink } from "../../store/fitData/state";
import userMessages from "../../userMessages";
import { Dict } from "../../types/utilTypes";
import { filterSeriesSet, odinToPlotly, WodinPlotData } from "../../plot";
import WodinOdePlot from "../WodinOdePlot.vue";

export default defineComponent({
    name: "FitPlot",
    components: { WodinOdePlot },
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
            const { data, link } = store.state.fitData;
            if (data && link) {
                const filteredData = data.filter(
                    (row: Dict<number>) => row[link.time] >= start && row[link.time] <= end
                );
                return [{
                    name: link.data,
                    x: filteredData.map((row: Dict<number>) => row[link.time]),
                    y: filteredData.map((row: Dict<number>) => row[link.data]),
                    mode: "markers",
                    type: "scatter",
                    marker: seriesColour(link.model)
                }];
            }
            return [];
        };

        const allPlotData = (start: number, end: number, points: number): WodinPlotData => {
            const result = solution.value && solution.value(start, end, points);
            if (!result) {
                return [];
            }
            const link = store.state.fitData.link;
            return [...odinToPlotly(filterSeriesSet(result, link.model), palette.value), ...fitDataSeries(start, end)];
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
