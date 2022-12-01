<template>
  <wodin-plot
      :fade-plot="fadePlot"
      :placeholder-message="placeholderMessage"
      :end-time="endTime"
      :plot-data="allPlotData"
      :redrawWatches="solutions ? [...solutions, allFitData, selectedVariables] : []">
    <slot></slot>
  </wodin-plot>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { PlotData } from "plotly.js-basic-dist-min";
import { format } from "d3-format";
import { FitDataGetter } from "../../store/fitData/getters";
import WodinPlot from "../WodinPlot.vue";
import {
    allFitDataToPlotly, filterSeriesSet, odinToPlotly, WodinPlotData
} from "../../plot";
import { DiscreteSeriesValues, OdinSolution } from "../../types/responseTypes";
import { AppType } from "../../store/appState/state";
import { runPlaceholderMessage } from "../../utils";

export default defineComponent({
    name: "SensitivityTracesPlot",
    props: {
        fadePlot: Boolean
    },
    components: {
        WodinPlot
    },
    setup() {
        const store = useStore();

        const solutions = computed(() => (store.state.sensitivity.result?.batch?.solutions || []));
        const isStochastic = computed(() => store.state.appType === AppType.Stochastic);
        const centralSolution = computed(() => {
            return isStochastic.value ? store.state.run.resultDiscrete?.solution : store.state.run.resultOde?.solution;
        });

        const endTime = computed(() => store.state.run.endTime);

        const palette = computed(() => store.state.model.paletteModel);

        const selectedVariables = computed(() => store.state.model.selectedVariables);

        const placeholderMessage = computed(() => runPlaceholderMessage(selectedVariables.value, true));

        const updatePlotTraceNameWithParameterValue = (plotTrace: Partial<PlotData>, param: string, value: number) => {
            // eslint-disable-next-line no-param-reassign
            plotTrace.name = `${plotTrace.name} (${param}=${format(".3f")(value)})`;
        };

        const allFitData = computed(() => store.getters[`fitData/${FitDataGetter.allData}`]);

        const allPlotData = (start: number, end: number, points: number): WodinPlotData => {
            const result: Partial<PlotData>[] = [];
            if (solutions.value.length) {
                const { pars } = store.state.sensitivity.result!.batch!;
                const time = {
                    mode: "grid" as const, tStart: start, tEnd: end, nPoints: points
                };
                solutions.value.forEach((sln: OdinSolution, slnIdx: number) => {
                    const data = sln(time);
                    const plotlyOptions = {
                        includeLegendGroup: true,
                        lineWidth: 1,
                        showLegend: false
                    };
                    if (data) {
                        const filtered = filterSeriesSet(data, selectedVariables.value);
                        const plotData = odinToPlotly(filtered, palette.value, plotlyOptions);
                        plotData.forEach((plotTrace) => {
                            updatePlotTraceNameWithParameterValue(plotTrace, pars.name,
                                pars.values[slnIdx]);
                        });

                        result.push(...plotData);
                    }
                });

                if (centralSolution.value) {
                    const centralData = centralSolution.value(time);
                    if (centralData) {
                        if (isStochastic.value) {
                            // Only show summary and deterministic values as central for stochastic
                            centralData.values = centralData.values
                                .filter((v: DiscreteSeriesValues) => v.description !== "Individual");
                        }
                        const plotlyOptions = { includeLegendGroup: true };
                        const filtered = filterSeriesSet(centralData, selectedVariables.value);
                        result.push(...odinToPlotly(filtered, palette.value, plotlyOptions));
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
            allFitData,
            selectedVariables
        };
    }
});
</script>
