<template>
    <wodin-plot
        :fade-plot="fadePlot"
        :placeholder-message="placeholderMessage"
        :end-time="endTime"
        :plot-data="allPlotData"
        :redrawWatches="
            solution ? [solution, allFitData, selectedVariables, parameterSetSolutions, displayNames, graphCount] : []
        "
        :graph-config="graphConfig"
    >
        <slot></slot>
    </wodin-plot>
</template>

<script setup lang="ts">
import { computed, defineProps, PropType } from "vue";
import { useStore } from "vuex";
import { FitDataGetter } from "../../store/fitData/getters";
import { odinToSkadiChart, allFitDataToSkadiChart, WodinPlotData, filterSeriesSet } from "../../plot";
import WodinPlot from "../WodinPlot.vue";
import { RunGetter } from "../../store/run/getters";
import { OdinSolution, Times } from "../../types/responseTypes";
import { Dict } from "../../types/utilTypes";
import { runPlaceholderMessage } from "../../utils";
import { ParameterSet } from "../../store/run/state";
import { GraphConfig } from "../../store/graphs/state";

const props = defineProps({
    fadePlot: Boolean,
    graphConfig: { type: Object as PropType<GraphConfig>, required: true },
});

const store = useStore();

const solution = computed(() => store.state.run.resultOde?.solution);
const visibleParameterSetNames = computed(() => store.getters[`run/${RunGetter.visibleParameterSetNames}`]);
const parameterSets = computed(() => store.state.run.parameterSets as ParameterSet[]);
const displayNames = computed(() => {
    return parameterSets.value.map((paramSet) => paramSet.displayName);
});

const parameterSetSolutions = computed(() => {
    const result = {} as Dict<OdinSolution>;
    Object.keys(store.state.run.parameterSetResults).forEach((name) => {
        const sln = store.state.run.parameterSetResults[name].solution;
        if (sln && visibleParameterSetNames.value.includes(name)) {
            result[name] = sln;
        }
    });
    return result;
});

const endTime = computed(() => store.state.run.endTime);

const palette = computed(() => store.state.model.paletteModel);

const allFitData = computed(() => store.getters[`fitData/${FitDataGetter.allData}`]);

const selectedVariables = computed(() => {
  const ret = props.graphConfig.selectedVariables
  console.log(ret);
  return ret;
});
const placeholderMessage = computed(() => runPlaceholderMessage(selectedVariables.value, false));

// TODO: put this in the composable in mrc-5572
const graphCount = computed(() => store.state.graphs.config.length);

const allPlotData = (start: number, end: number, points: number): WodinPlotData => {
    const options = {
        mode: "grid",
        tStart: start,
        tEnd: end,
        nPoints: points
    };
    const result = solution.value && solution.value(options);
    if (!result) {
        return { lines: [], points: [] };
    }

    // 1. Current parameter values
    const allData: WodinPlotData = {
        lines: odinToSkadiChart(filterSeriesSet(result, selectedVariables.value), palette.value),
        points: allFitDataToSkadiChart(allFitData.value, palette.value, start, end, selectedVariables.value)
    };

    // 2. Parameter sets
    const lineStylesForParamSets = computed(() => store.getters[`run/${RunGetter.lineStylesForParameterSets}`]);

    Object.keys(parameterSetSolutions.value).forEach((name) => {
        const paramSetSln = parameterSetSolutions.value[name];
        const paramSetResult = paramSetSln!(options as Times);

        const strokeDasharray = lineStylesForParamSets.value[name];
        if (paramSetResult) {
            const filteredSetData = filterSeriesSet(paramSetResult, selectedVariables.value);
            const plotData = odinToSkadiChart(filteredSetData, palette.value, { strokeDasharray });
            const currentParamSet = parameterSets.value.find((paramSet) => paramSet.name === name);
            plotData.forEach(line => {
                line.metadata!.tooltipName = `${line.metadata!.name} (${currentParamSet!.displayName})`;
            });
            allData.lines.push(...plotData);
        }
    });
    return allData;
};
</script>
