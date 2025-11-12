<template>
    <wodin-plot
        :fade-plot="fadePlot"
        :placeholder-message="placeholderMessage"
        :end-time="endTime"
        :plot-data="allPlotData"
        :redrawWatches="
            result && solutions
                ? [
                      ...solutions,
                      result,
                      allFitData,
                      selectedVariables,
                      parameterSetBatches,
                      parameterSetDisplayNames,
                      graphCount
                  ]
                : []
        "
        :graph-config="graphConfig"
    >
        <slot></slot>
    </wodin-plot>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { useStore } from "vuex";
import { FitDataGetter } from "../../store/fitData/getters";
import WodinPlot from "../WodinPlot.vue";
import {
    allFitDataToSkadiChart,
    filterSeriesSet,
    odinToSkadiChart,
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
import { GraphConfig } from "../../store/graphs/state";
import { LineStyle } from "@reside-ic/skadi-chart";

export default defineComponent({
    name: "SensitivityTracesPlot",
    props: {
        fadePlot: Boolean,
        graphConfig: { type: Object as PropType<GraphConfig>, required: true }
    },
    components: {
        WodinPlot
    },
    setup(props) {
        const store = useStore();

        const solutions = computed(() => store.state.sensitivity.result?.batch?.solutions || []);

        const result = computed(() => store.state.sensitivity.result);

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

        const selectedVariables = computed(() => props.graphConfig.selectedVariables);

        // TODO: put this in the composable in mrc-5572
        const graphCount = computed(() => store.state.graphs.config.length);

        const placeholderMessage = computed(() => runPlaceholderMessage(selectedVariables.value, true));

        const allFitData = computed(() => store.getters[`fitData/${FitDataGetter.allData}`]);

        const allPlotData = (start: number, end: number, points: number): WodinPlotData => {
            const result: WodinPlotData = { lines: [], points: [] };
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
                    updatePlotTrace?: (plotTrace: WodinPlotData["lines"][number]) => void,
                    filterOutput?: (output: OdinSeriesSet) => void,
                    style?: LineStyle
                ) => {
                    const data = solution(time);
                    if (data) {
                        if (filterOutput) {
                            filterOutput(data);
                        }
                        // Always filter to selected variables
                        const filtered = filterSeriesSet(data, selectedVariables.value);
                        const plotData = odinToSkadiChart(filtered, palette.value, style);
                        if (updatePlotTrace) plotData.forEach(updatePlotTrace);

                        result.lines.push(...plotData);
                    }
                };

                solutions.value.forEach((sln: OdinSolution, slnIdx: number) => {
                    addSolutionOutputToResult(sln, (plotTrace) =>
                        updatePlotTraceName(plotTrace, varyingParamName, parValues[slnIdx]),
                        undefined,
                        { strokeWidth: 1 }
                    );
                });

                if (centralSolution.value) {
                    const filterStochasticCentralOutput = (centralOutput: OdinSeriesSet) => {
                        // Only show summary and deterministic values as central for stochastic
                        centralOutput.values = centralOutput.values.filter(
                            (v: DiscreteSeriesValues) => v.description !== "Individual"
                        );
                    };
                    addSolutionOutputToResult(
                        centralSolution.value,
                        undefined,
                        isStochastic.value ? filterStochasticCentralOutput : undefined
                    );
                }

                // Plot sensitivity for parameter sets
                const parameterSetNames = Object.keys(parameterSetBatches.value);
                parameterSetNames.forEach((name) => {
                    const setSolutions = parameterSetBatches.value[name]?.solutions || [];
                    const strokeDasharray = lineStylesForParameterSets.value[name];
                    const currentParamSet = parameterSets.value.find((paramSet) => paramSet.name === name);
                    setSolutions.forEach((sln: OdinSolution, slnIdx: number) => {
                        addSolutionOutputToResult(sln, (plotTrace) =>
                            updatePlotTraceName(
                                plotTrace,
                                varyingParamName,
                                parValues[slnIdx],
                                currentParamSet!.displayName
                            ),
                            undefined,
                            { strokeDasharray, strokeWidth: 1 }
                        );
                    });

                    // Also plot the centrals
                    const setCentralSolution = parameterSetCentralResults.value[name]?.solution;
                    if (setCentralSolution) {
                        addSolutionOutputToResult(setCentralSolution, (plotTrace) =>
                            updatePlotTraceName(plotTrace, null, null, currentParamSet!.displayName),
                            undefined,
                            { strokeDasharray }
                        );
                    }
                });

                if (allFitData.value) {
                    result.points.push(
                        ...allFitDataToSkadiChart(
                            allFitData.value,
                            palette.value,
                            start,
                            end,
                            props.graphConfig.selectedVariables
                        )
                    );
                }
            }

            store.commit(`sensitivity/${SensitivityMutation.SetLoading}`, false);
            return result;
        };

        return {
            placeholderMessage,
            endTime,
            solutions,
            result,
            allPlotData,
            allFitData,
            selectedVariables,
            parameterSetBatches,
            parameterSetDisplayNames,
            graphCount
        };
    }
});
</script>
