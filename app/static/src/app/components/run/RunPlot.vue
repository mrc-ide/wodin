<template>
    <wodin-plot
        :fade-plot="fadePlot"
        :placeholder-message="placeholderMessage"
        :end-time="endTime"
        :plot-data="allPlotData"
        :redrawWatches="
            solution ? [solution, allFitData, selectedVariables, parameterSetSolutions, displayNames, graphCount] : []
        "
        :linked-x-axis="linkedXAxis"
        :fit-plot="false"
        :graph-index="graphIndex"
        :graph-config="graphConfig"
        @updateXAxis="updateXAxis"
    >
        <slot></slot>
    </wodin-plot>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, PropType } from "vue";
import { useStore } from "vuex";
import { LayoutAxis, PlotData } from "plotly.js-basic-dist-min";
import { FitDataGetter } from "../../store/fitData/getters";
import { odinToPlotly, allFitDataToPlotly, WodinPlotData, filterSeriesSet } from "../../plot";
import WodinPlot from "../WodinPlot.vue";
import { RunGetter } from "../../store/run/getters";
import { OdinSolution, Times } from "../../types/responseTypes";
import { Dict } from "../../types/utilTypes";
import { runPlaceholderMessage } from "../../utils";
import { ParameterSet } from "../../store/run/state";
import { GraphConfig } from "../../store/graphs/state";

const props = defineProps({
    fadePlot: Boolean,
    graphIndex: { type: Number, required: true },
    graphConfig: { type: Object as PropType<GraphConfig>, required: true },
    linkedXAxis: { type: Object as PropType<Partial<LayoutAxis> | null>, required: true }
});

const emit = defineEmits<{
    (e: "updateXAxis", options: Partial<LayoutAxis>): void;
}>();

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

const selectedVariables = computed(() => props.graphConfig.selectedVariables);
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
        return [];
    }

    // 1. Current parameter values
    const plotOptions = { showLegend: true, includeLegendGroup: true };
    const allData = [
        ...odinToPlotly(filterSeriesSet(result, selectedVariables.value), palette.value, plotOptions),
        ...allFitDataToPlotly(allFitData.value, palette.value, start, end, props.graphConfig.selectedVariables)
    ];

    // 2. Parameter sets
    const lineStylesForParamSets = computed(() => store.getters[`run/${RunGetter.lineStylesForParameterSets}`]);

    const updatePlotTraceNameWithParameterSetName = (plotTrace: Partial<PlotData>, setName: string) => {
        // eslint-disable-next-line no-param-reassign
        plotTrace.name = `${plotTrace.name} (${setName})`;
    };

    Object.keys(parameterSetSolutions.value).forEach((name) => {
        const paramSetSln = parameterSetSolutions.value[name];
        const paramSetResult = paramSetSln!(options as Times);

        const dash = lineStylesForParamSets.value[name];
        if (paramSetResult) {
            const filteredSetData = filterSeriesSet(paramSetResult, selectedVariables.value);
            const paramSetOptions = { dash, showLegend: false, includeLegendGroup: true };
            const plotData = odinToPlotly(filteredSetData, palette.value, paramSetOptions);
            const currentParamSet = parameterSets.value.find((paramSet) => paramSet.name === name);
            plotData.forEach((plotTrace) => {
                updatePlotTraceNameWithParameterSetName(plotTrace, currentParamSet!.displayName);
            });
            allData.push(...plotData);
        }
    });
    return allData;
};

const updateXAxis = (options: Partial<LayoutAxis>) => {
    emit("updateXAxis", options);
};
</script>
