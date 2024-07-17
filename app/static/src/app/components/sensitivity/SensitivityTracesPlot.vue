<template>
    <wodin-plot
        :fade-plot="fadePlot"
        :placeholder-message="placeholderMessage"
        :end-time="endTime"
        :plot-data="allPlotData"
        :redrawWatches="
            solutions
                ? [...solutions, allFitData, selectedVariables, parameterSetBatches, parameterSetDisplayNames]
                : []
        "
        :fit-plot="false"
        :graph-index="0"
        :graph-config="graphConfig"
    >
        <slot></slot>
    </wodin-plot>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { PlotData } from "plotly.js-basic-dist-min";
import { FitDataGetter } from "../../store/fitData/getters";
import WodinPlot from "../WodinPlot.vue";
import {
    allFitDataToPlotly,
    filterSeriesSet,
    odinToPlotly,
    PlotlyOptions,
    updatePlotTraceName,
    WodinPlotData
} from "../../plot";
import { Batch, DiscreteSeriesValues, OdinSeriesSet, OdinSolution, VaryingPar } from "../../types/responseTypes";
import { AppType } from "../../store/appState/state";
import { runPlaceholderMessage } from "../../utils";
import { RunGetter } from "../../store/run/getters";
import { Dict } from "../../types/utilTypes";
import { ParameterSet } from "../../store/run/state";
import { SensitivityMutation } from "../../store/sensitivity/mutations";

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

        const solutions = computed(() => store.state.sensitivity.result?.batch?.solutions || []);
        const graphConfig = computed(() => store.state.graphs.config[0]);

        const visibleParameterSetNames = computed(() => store.getters[`run/${RunGetter.visibleParameterSetNames}`]);
        const parameterSets = computed(() => store.state.run.parameterSets as ParameterSet[]);
        const parameterSetDisplayNames = computed(() => {
            return parameterSets.value.map((paramSet) => paramSet.displayName);
        });
        const paramSettings = computed(() => store.state.sensitivity.paramSettings);

        const parameterSetBatches = computed(() => {
            const result = {} as Dict<Batch>;
            Object.keys(store.state.sensitivity.parameterSetResults).forEach((name) => {
                if (visibleParameterSetNames.value.includes(name)) {
                    result[name] = store.state.sensitivity.parameterSetResults[name].batch;
                }
            });
            return result;
        });

        const isStochastic = computed(() => store.state.appType === AppType.Stochastic);
        const centralSolution = computed(() => {
            return isStochastic.value ? store.state.run.resultDiscrete?.solution : store.state.run.resultOde?.solution;
        });
        const parameterSetCentralResults = computed(() => store.state.run.parameterSetResults);

        const lineStylesForParameterSets = computed(() => store.getters[`run/${RunGetter.lineStylesForParameterSets}`]);

        const endTime = computed(() => store.state.run.endTime);

        const palette = computed(() => store.state.model.paletteModel);

        const selectedVariables = computed(() => store.state.graphs.config[0].selectedVariables);

        const placeholderMessage = computed(() => runPlaceholderMessage(selectedVariables.value, true));

        const allFitData = computed(() => store.getters[`fitData/${FitDataGetter.allData}`]);

        const allPlotData = (start: number, end: number, points: number): WodinPlotData => {
            const result: Partial<PlotData>[] = [];
            if (solutions.value.length) {
                const { pars } = store.state.sensitivity.result!.batch!;
                const time = {
                    mode: "grid" as const,
                    tStart: start,
                    tEnd: end,
                    nPoints: points
                };
                const varyingParamName = paramSettings.value.parameterToVary;
                const varyingPar = pars.varying.filter((v: VaryingPar) => v.name === varyingParamName);
                const parValues = varyingPar.length ? varyingPar[0].values : [];

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
                    addSolutionOutputToResult(sln, plotlyOptions, (plotTrace) =>
                        updatePlotTraceName(plotTrace, varyingParamName, parValues[slnIdx])
                    );
                });

                if (centralSolution.value) {
                    const plotlyOptions = { includeLegendGroup: true };
                    const filterStochasticCentralOutput = (centralOutput: OdinSeriesSet) => {
                        // Only show summary and deterministic values as central for stochastic
                        // eslint-disable-next-line no-param-reassign
                        centralOutput.values = centralOutput.values.filter(
                            (v: DiscreteSeriesValues) => v.description !== "Individual"
                        );
                    };
                    addSolutionOutputToResult(
                        centralSolution.value,
                        plotlyOptions,
                        undefined,
                        isStochastic.value ? filterStochasticCentralOutput : undefined
                    );
                }

                // Plot sensitivity for parameter sets
                const parameterSetNames = Object.keys(parameterSetBatches.value);
                parameterSetNames.forEach((name) => {
                    const setSolutions = parameterSetBatches.value[name]?.solutions || [];
                    const dash = lineStylesForParameterSets.value[name];
                    const plotlyOptions = {
                        includeLegendGroup: true,
                        lineWidth: 1,
                        showLegend: false,
                        dash
                    };
                    const currentParamSet = parameterSets.value.find((paramSet) => paramSet.name === name);
                    setSolutions.forEach((sln: OdinSolution, slnIdx: number) => {
                        addSolutionOutputToResult(sln, plotlyOptions, (plotTrace) =>
                            updatePlotTraceName(
                                plotTrace,
                                varyingParamName,
                                parValues[slnIdx],
                                currentParamSet!.displayName
                            )
                        );
                    });

                    // Also plot the centrals
                    const setCentralSolution = parameterSetCentralResults.value[name]?.solution;
                    const centralOptions = { showLegend: false, includeLegendGroup: true, dash };
                    if (setCentralSolution) {
                        addSolutionOutputToResult(setCentralSolution, centralOptions, (plotTrace) =>
                            updatePlotTraceName(plotTrace, null, null, currentParamSet!.displayName)
                        );
                    }
                });

                if (allFitData.value) {
                    result.push(...allFitDataToPlotly(allFitData.value, palette.value, start, end));
                }
            }

            store.commit(`sensitivity/${SensitivityMutation.SetLoading}`, false);
            return result;
        };

        return {
            graphConfig,
            placeholderMessage,
            endTime,
            solutions,
            allPlotData,
            allFitData,
            selectedVariables,
            parameterSetBatches,
            parameterSetDisplayNames
        };
    }
});
</script>
