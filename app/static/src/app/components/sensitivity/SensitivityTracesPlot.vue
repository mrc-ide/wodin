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
    allFitDataToPlotly, filterSeriesSet, odinToPlotly, PlotlyOptions, WodinPlotData
} from "../../plot";
import {
    DiscreteSeriesValues, Odin, OdinSeriesSet, OdinSolution
} from "../../types/responseTypes";
import { AppType } from "../../store/appState/state";
import { runPlaceholderMessage } from "../../utils";
import { RunGetter } from "../../store/run/getters";

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
        const parameterSetResults = computed(() => store.state.sensitivity.parameterSetResults);
        const isStochastic = computed(() => store.state.appType === AppType.Stochastic);
        const centralSolution = computed(() => {
            return isStochastic.value ? store.state.run.resultDiscrete?.solution : store.state.run.resultOde?.solution;
        });
        const parameterSetCentralResults = computed(() => store.state.run.parameterSetResults);

        const lineStylesForParameterSets = computed(() => store.getters[`run/${RunGetter.lineStylesForParameterSets}`]);

        const endTime = computed(() => store.state.run.endTime);

        const palette = computed(() => store.state.model.paletteModel);

        const selectedVariables = computed(() => store.state.model.selectedVariables);

        const placeholderMessage = computed(() => runPlaceholderMessage(selectedVariables.value, true));

        const updatePlotTraceName = (plotTrace: Partial<PlotData>, param: string | null, value: number | null, parameterSetName = "") => {
            const parenthesisItems = [];
            if (param && value) {
                parenthesisItems.push(`${param}=${format(".3f")(value)}`);
            }
            if (parameterSetName) {
                parenthesisItems.push(parameterSetName);
            }
            // eslint-disable-next-line no-param-reassign
            plotTrace.name = `${plotTrace.name} (${parenthesisItems.join(" ")})`;
        };

        const allFitData = computed(() => store.getters[`fitData/${FitDataGetter.allData}`]);

        const allPlotData = (start: number, end: number, points: number): WodinPlotData => {
            const result: Partial<PlotData>[] = [];
            if (solutions.value.length) {
                const { pars } = store.state.sensitivity.result!.batch!;
                const time = {
                    mode: "grid" as const, tStart: start, tEnd: end, nPoints: points
                };

                const addSolutionOutputToResult = (
                    solution: OdinSolution,
                    options: Partial<PlotlyOptions>,
                    updatePlotTrace?: (plotTrace: Partial<PlotData>) => void,
                    filterOutput?: (output: OdinSeriesSet) => void
                ) => {
                    const data = solution(time);
                    if (data) {
                        if (filterOutput) {
                            filterOutput(data);
                        }
                        // Always filter to selected variables
                        const filtered = filterSeriesSet(data, selectedVariables.value);
                        const plotData = odinToPlotly(filtered, palette.value, options);
                        if (updatePlotTrace) {
                            plotData.forEach((plotTrace) => {
                                updatePlotTrace(plotTrace);
                            });
                        }

                        result.push(...plotData);
                    }
                };

                solutions.value.forEach((sln: OdinSolution, slnIdx: number) => {
                    const plotlyOptions = {
                        includeLegendGroup: true,
                        lineWidth: 1,
                        showLegend: false
                    };
                    addSolutionOutputToResult(sln, plotlyOptions,
                        (plotTrace) => updatePlotTraceName(plotTrace, pars.name, pars.values[slnIdx]));
                });

                if (centralSolution.value) {
                    const plotlyOptions = { includeLegendGroup: true };
                    const filterStochasticCentralOutput = (centralOutput: OdinSeriesSet) => {
                        // Only show summary and deterministic values as central for stochastic
                        // eslint-disable-next-line no-param-reassign
                        centralOutput.values = centralOutput.values
                            .filter((v: DiscreteSeriesValues) => v.description !== "Individual");
                    };
                    addSolutionOutputToResult(centralSolution.value, plotlyOptions, undefined,
                        isStochastic.value ? filterStochasticCentralOutput : undefined);
                }

                // Plot sensitivity for parameter sets
                const parameterSetNames = Object.keys(parameterSetResults.value);
                parameterSetNames.forEach((name) => {
                    const setSolutions = parameterSetResults.value[name].batch?.solutions || [];
                    const dash = lineStylesForParameterSets.value[name];
                    const plotlyOptions = {
                        includeLegendGroup: true,
                        lineWidth: 1,
                        showLegend: false,
                        dash
                    };
                    setSolutions.forEach((sln: OdinSolution, slnIdx: number) => {
                        addSolutionOutputToResult(sln, plotlyOptions,
                            (plotTrace) => updatePlotTraceName(plotTrace, pars.name, pars.values[slnIdx], name));
                    });

                    // Also plot the centrals
                    const setCentralSolution = parameterSetCentralResults.value[name]?.solution;
                    if (setCentralSolution) {
                        addSolutionOutputToResult(setCentralSolution, { showLegend: false, includeLegendGroup: true, dash },
                            (plotTrace) => updatePlotTraceName(plotTrace, null, null, name));
                    }
                });

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
