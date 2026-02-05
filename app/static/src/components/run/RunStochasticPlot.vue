<template>
    <wodin-plot
        :fade-plot="fadePlot"
        :placeholder-message="placeholderMessage"
        :end-time="endTime"
        :plot-data="allPlotData"
        :redrawWatches="solution ? [solution, graphCount] : []"
        :graph-config="graphConfig"
    >
        <slot></slot>
    </wodin-plot>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { useStore } from "vuex";
import { WodinPlotData, discreteSeriesSetToSkadiChart, filterSeriesSet } from "../../plot";
import WodinPlot from "../WodinPlot.vue";
import { runPlaceholderMessage } from "../../utils";
import { StochasticConfig } from "../../types/responseTypes";
import { GraphConfig } from "../../store/graphs/state";

export default defineComponent({
    name: "RunStochasticPlot",
    props: {
        fadePlot: Boolean,
        graphConfig: {
            type: Object as PropType<GraphConfig>,
            required: true
        },
    },
    components: {
        WodinPlot
    },
    setup(props) {
        const store = useStore();

        const selectedVariables = computed(() => props.graphConfig.selectedVariables);
        const placeholderMessage = computed(() => runPlaceholderMessage(selectedVariables.value, false));

        const solution = computed(() => store.state.run.resultDiscrete?.solution);

        const endTime = computed(() => store.state.run.endTime);

        const palette = computed(() => store.state.model.paletteModel);

        // TODO: put this in the composable in mrc-5572
        const graphCount = computed(() => store.state.graphs.config.length);

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
                return { lines: [], points: [] };
            }
            const replicates = store.state.run.numberOfReplicates;
            const maxReplicatesDisplay = (store.state.config as StochasticConfig)?.maxReplicatesDisplay;
            const showIndividualTraces = replicates <= maxReplicatesDisplay;

            return {
            lines: discreteSeriesSetToSkadiChart(
                filterSeriesSet(result, selectedVariables.value),
                palette.value,
                showIndividualTraces
            ),
            points: []
            }
        };

        return {
            placeholderMessage,
            endTime,
            graphCount,
            allPlotData,
            solution,
        };
    }
});
</script>
