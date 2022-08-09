<template>
    <div class="fit-plot-container" :style="plotStyle">
      <div class="fit-plot" ref="plot">
      </div>
      <div v-if="!hasPlotData" class="plot-placeholder">
        {{ placeholderMessage }}
      </div>
      <slot></slot>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, ref, watch, onMounted, onUnmounted
} from "vue";
import { useStore } from "vuex";
import { EventEmitter } from "events";
import {
    Data, newPlot, react, PlotData, PlotRelayoutEvent, Plots
} from "plotly.js";
import { FitDataGetter } from "../../store/fitData/getters";
import userMessages from "../../userMessages";
import { Dict } from "../../types/utilTypes";
import { filterSeriesSet, odinToPlotly } from "../../plot";

export default defineComponent({
    name: "FitPlot",
    props: {
        fadePlot: Boolean
    },
    setup(props) {
        const store = useStore();

        const placeholderMessage = computed(() => userMessages.modelFit.notFittedYet);

        const plotStyle = computed(() => (props.fadePlot ? "opacity:0.5;" : ""));
        const solution = computed(() => store.state.modelFit.solution);

        const startTime = 0;
        const endTime = computed(() => store.getters[`fitData/${FitDataGetter.dataEnd}`]);

        const palette = computed(() => store.state.model.paletteModel);

        const plot = ref<null | HTMLElement>(null); // Picks up the element with 'plot' ref in the template
        const baseData = ref<Data[]>([]);
        const nPoints = 1000; // TODO: appropriate value could be derived from width of element

        const hasPlotData = computed(() => !!(baseData.value?.length));

        const seriesColour = (variable: string) => ({ color: palette.value[variable] });

        const fitDataSeries = (start: number, end: number): Partial<PlotData>[] => {
            const { fitData } = store.state;
            const timeVar = fitData?.timeVariable;
            const dataVar = fitData?.columnToFit;
            if (fitData.data && dataVar && timeVar) {
                const filteredData = fitData.data.filter(
                    (row: Dict<number>) => row[timeVar] >= start && row[timeVar] <= end
                );
                const modelVar = fitData.linkedVariables[dataVar];
                return [{
                    name: dataVar,
                    x: filteredData.map((row: Dict<number>) => row[timeVar]),
                    y: filteredData.map((row: Dict<number>) => row[dataVar]),
                    mode: "markers",
                    type: "scatter",
                    marker: seriesColour(modelVar)
                }];
            }
            return [];
        };

        const allPlotData = (start: number, end: number): Partial<PlotData>[] => {
            const result = solution.value(start, end, nPoints);
            if (!result) {
                return [];
            }
            const { fitData } = store.state;
            const dataVar = fitData?.columnToFit;
            const modelVar = fitData.linkedVariables[dataVar];
            return [...odinToPlotly(filterSeriesSet(result, modelVar)), ...fitDataSeries(start, end)];
        };

        const config = {
            responsive: true
        };

        // This is enough top margin to accomodate the plotly options
        // bar without it interfering with the first series in the
        // legend.
        const margin = {
            t: 25
        };

        const relayout = async (event: PlotRelayoutEvent) => {
            let data;
            if (event["xaxis.autorange"] === true) {
                data = baseData.value;
            } else {
                const t0 = event["xaxis.range[0]"];
                const t1 = event["xaxis.range[1]"];
                if (t0 === undefined || t1 === undefined) {
                    return;
                }
                data = allPlotData(t0, t1);
            }

            const layout = {
                margin,
                uirevision: "true",
                xaxis: { autorange: true },
                yaxis: { autorange: true }
            };

            const el = plot.value as HTMLElement;
            await react(el, data, layout, config);
        };

        const resize = () => {
            if (plot.value) {
                Plots.resize(plot.value as HTMLElement);
            }
        };

        let resizeObserver: null | ResizeObserver = null;

        const drawPlot = () => {
            if (solution.value) {
                baseData.value = allPlotData(startTime, endTime.value);

                if (hasPlotData.value) {
                    const el = plot.value as unknown;
                    const layout = {
                        margin
                    };
                    newPlot(el as HTMLElement, baseData.value, layout, config);
                    (el as EventEmitter).on("plotly_relayout", relayout);
                    resizeObserver = new ResizeObserver(resize);
                    resizeObserver.observe(plot.value as HTMLElement);
                }
            }
        };

        onMounted(drawPlot);

        watch(solution, drawPlot);

        onUnmounted(() => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        });

        return {
            placeholderMessage,
            plotStyle,
            plot,
            relayout,
            resize,
            solution,
            baseData,
            hasPlotData
        };
    }
});
</script>
<style scoped lang="scss">
  .plot-placeholder {
    width: 100%;
    height: 450px;
    background-color: #eee;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
</style>
