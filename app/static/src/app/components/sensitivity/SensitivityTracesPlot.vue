<template>
  <wodin-ode-plot
      :fade-plot="fadePlot"
      :placeholder-message="placeholderMessage"
      :end-time="endTime"
      :plot-data="allPlotData"
      :redrawWatches="solutions ? [...solutions, allFitData] : []">
    <slot></slot>
  </wodin-ode-plot>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { PlotData } from "plotly.js";
import { format } from "d3-format";
import { FitDataGetter } from "../../store/fitData/getters";
import WodinOdePlot from "../WodinOdePlot.vue";
import userMessages from "../../userMessages";
import { allFitDataToPlotly, odinToPlotly, WodinPlotData } from "../../plot";
import { OdinSolution } from "../../types/responseTypes";

export default defineComponent({
    name: "SensitivityTracesPlot",
    props: {
        fadePlot: Boolean
    },
    components: {
        WodinOdePlot
    },
    setup() {
        const store = useStore();

        const placeholderMessage = userMessages.sensitivity.notRunYet;

        const solutions = computed(() => (store.state.sensitivity.result?.batch?.solutions || []));
        const centralSolution = computed(() => (store.state.run.result?.solution));

        const endTime = computed(() => store.state.run.endTime);

        const palette = computed(() => store.state.model.paletteModel);

        const updatePlotTraceNameWithParameterValue = (plotTrace: Partial<PlotData>, param: string, value: number) => {
            // eslint-disable-next-line no-param-reassign
            plotTrace.name = `${plotTrace.name} (${param}=${format(".3f")(value)})`;
        };

        const allFitData = computed(() => store.getters[`fitData/${FitDataGetter.allData}`]);

        const allPlotData = (start: number, end: number, points: number): WodinPlotData => {
            const result: Partial<PlotData>[] = [];
            if (solutions.value.length) {
                const { pars } = store.state.sensitivity.result!.batch!;
                solutions.value.forEach((sln: OdinSolution, slnIdx: number) => {
                    const data = sln({
                        mode: "grid", tStart: start, tEnd: end, nPoints: points
                    });
                    const plotlyOptions = {
                        includeLegendGroup: true,
                        lineWidth: 1,
                        showLegend: false
                    };
                    if (data) {
                        const plotData = odinToPlotly(data, palette.value, plotlyOptions);
                        plotData.forEach((plotTrace) => {
                            updatePlotTraceNameWithParameterValue(plotTrace, pars.name,
                                pars.values[slnIdx]);
                        });

                        result.push(...plotData);
                    }
                });

                if (centralSolution.value) {
                    const centralData = centralSolution.value(start, end, points);
                    if (centralData) {
                        const plotlyOptions = { includeLegendGroup: true };
                        result.push(...odinToPlotly(centralData, palette.value, plotlyOptions));
                    }
                }

                if (allFitData.value) {
                    result.push(...allFitDataToPlotly(allFitData.value, palette.value, start, end));
                }
            }

            return result;
        };

        return {
            placeholderMessage,
            endTime,
            solutions,
            allPlotData,
            allFitData
        };
    }
});
</script>
