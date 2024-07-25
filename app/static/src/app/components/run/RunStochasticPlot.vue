<template>
    <wodin-plot
        :fade-plot="fadePlot"
        :placeholder-message="placeholderMessage"
        :end-time="endTime"
        :plot-data="allPlotData"
        :redrawWatches="solution ? [solution] : []"
        :linked-x-axis="linkedXAxis"
        :fit-plot="false"
        :graph-index="graphIndex"
        :graph-config="graphConfig"
        @updateXAxis="updateXAxis"
    >
        <slot></slot>
    </wodin-plot>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { useStore } from "vuex";
import { LayoutAxis } from "plotly.js-basic-dist-min";
import { WodinPlotData, discreteSeriesSetToPlotly, filterSeriesSet } from "../../plot";
import WodinPlot from "../WodinPlot.vue";
import { runPlaceholderMessage } from "../../utils";
import { StochasticConfig } from "../../types/responseTypes";
import { GraphConfig } from "../../store/graphs/state";

export default defineComponent({
    name: "RunStochasticPlot",
    props: {
        fadePlot: Boolean,
        graphIndex: {
            type: Number,
            required: true
        },
        graphConfig: {
            type: Object as PropType<GraphConfig>,
            required: true
        },
        linkedXAxis: {
            type: Object as PropType<Partial<LayoutAxis> | null>,
            required: true
        }
    },
    components: {
        WodinPlot
    },
    emits: ["updateXAxis"],
    setup(props, { emit }) {
        const store = useStore();

        const selectedVariables = computed(() => props.graphConfig.selectedVariables);
        const placeholderMessage = computed(() => runPlaceholderMessage(selectedVariables.value, false));

        const solution = computed(() => store.state.run.resultDiscrete?.solution);

        const endTime = computed(() => store.state.run.endTime);

        const palette = computed(() => store.state.model.paletteModel);

        const allPlotData = (start: number, end: number, points: number): WodinPlotData => {
            const result =
                solution.value &&
                solution.value({
                    mode: "grid",
                    tStart: start,
                    tEnd: end,
                    nPoints: points
                });
            if (!result) {
                return [];
            }
            const replicates = store.state.run.numberOfReplicates;
            const maxReplicatesDisplay = (store.state.config as StochasticConfig)?.maxReplicatesDisplay;
            const showIndividualTraces = replicates <= maxReplicatesDisplay;

            return discreteSeriesSetToPlotly(
                filterSeriesSet(result, selectedVariables.value),
                palette.value,
                showIndividualTraces
            );
        };

        const updateXAxis = (options: Partial<LayoutAxis>) => {
            emit("updateXAxis", options);
        };

        return {
            placeholderMessage,
            endTime,
            allPlotData,
            solution,
            updateXAxis
        };
    }
});
</script>
