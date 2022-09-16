<template>
    <wodin-ode-plot
        :fade-plot="fadePlot"
        :placeholder-message="placeholderMessage"
        :end-time="endTime"
        :plot-data="allPlotData"
        :redrawWatches="solution ? [solution] : []">
        <slot></slot>
    </wodin-ode-plot>
</template>

<script lang="ts">
import {
    computed, defineComponent
} from "vue";
import { useStore } from "vuex";
import { FitDataGetter } from "../../store/fitData/getters";
import userMessages from "../../userMessages";
import {
    filterSeriesSet, fitDataToPlotly, odinToPlotly, WodinPlotData
} from "../../plot";
import WodinOdePlot from "../WodinOdePlot.vue";
import {plot} from "plotly.js";

export default defineComponent({
    name: "FitPlot",
    components: { WodinOdePlot },
    props: {
        fadePlot: Boolean
    },
    setup() {
        const store = useStore();

        const placeholderMessage = userMessages.modelFit.notFittedYet;

        // If we're displaying a reloaded session with fit, we should be able to plot the previous fit plot without
        // re-running fit. Determine if this is the case, by checking if we have a fit result but no fit solution
        // (which is not persisted)
        const plotRehydratedFit = computed(() => {
          const {modelFit} = store.state;
          return modelFit.result && !modelFit.result.solution && !modelFit.result.error;
        });

        const solution = computed(() => {
          return plotRehydratedFit.value ? store.state.modelFit.result?.solution : store.state.run.result?.solution;
        });

        const endTime = computed(() => store.getters[`fitData/${FitDataGetter.dataEnd}`]);

        const link = computed(() => store.getters[`fitData/${FitDataGetter.link}`]);

        const allPlotData = (start: number, end: number, points: number): WodinPlotData => {
            const data = plotRehydratedFit.value ? store.state.modelFit.result.inputs.data : store.state.fitData.data;
            const result = solution.value && solution.value({
                mode: "grid", tStart: start, tEnd: end, nPoints: points
            });
            if (!data || !link.value || !result) {
                return [];
            }
            const palette = store.state.model.paletteModel;
            return [
                ...odinToPlotly(filterSeriesSet(result, link.value.model), palette),
                ...fitDataToPlotly(data, link.value, palette, start, end)
            ];
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
