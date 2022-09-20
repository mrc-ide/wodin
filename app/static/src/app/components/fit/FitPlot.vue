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
import { plot } from "plotly.js";
import { FitDataGetter } from "../../store/fitData/getters";
import userMessages from "../../userMessages";
import {
  filterSeriesSet, fitDataToPlotly, odinToPlotly, rehydratedFitDataToPlotly, WodinPlotData
} from "../../plot";
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

        // If we're displaying a reloaded session with fit, we should be able to plot the previous fit plot without
        // re-running fit. Determine if this is the case, by checking if we have a fit result but no fit solution
        // (which is not persisted)
        const plotRehydratedFit = computed(() => {
            const { modelFit } = store.state;
            const result = modelFit.result && !modelFit.result.solution && !modelFit.result.error;
            console.log(`plotting rehyd fit: ${result}`);
            return result;
        });

        const solution = computed(() => {
            return plotRehydratedFit.value ? store.state.run.result?.solution : store.state.modelFit.result?.solution;
        });

        const endTime = computed(() => {
          return plotRehydratedFit.value ? store.state.modelFit.result.inputs.endTime : store.getters[`fitData/${FitDataGetter.dataEnd}`];
        });

        const link = computed(() => {
          return plotRehydratedFit.value ? store.state.modelFit.result.inputs.link : store.getters[`fitData/${FitDataGetter.link}`]
        });

        const allPlotData = (start: number, end: number, points: number): WodinPlotData => {
            let dataToPlot = [];
            const palette = store.state.model.paletteModel;
            const result = solution.value && solution.value({
                mode: "grid", tStart: start, tEnd: end, nPoints: points
            });

            if (plotRehydratedFit.value) {
                dataToPlot = rehydratedFitDataToPlotly(store.state.modelFit.result.inputs.data, link.value, palette);
            } else {
                const { data } = store.state.fitData;

                if (!data || !link.value || !result) {
                    return [];
                }

                dataToPlot = fitDataToPlotly(data, link.value, palette, start, end);
            }

            return [
                ...odinToPlotly(filterSeriesSet(result, link.value.model), palette),
                ...dataToPlot
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
