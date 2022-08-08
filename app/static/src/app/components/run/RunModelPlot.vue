<template>
    <div class="run-plot-container" :style="plotStyle">
      <div class="run-model-plot" ref="plot">
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
import { OdinSeriesSet } from "../../types/responseTypes";
import { Dict } from "../../types/utilTypes";

export default defineComponent({
    name: "RunModelPlot",
    props: {
        fadePlot: Boolean,
        modelFit: Boolean
    },
    setup(props) {
        const store = useStore();

        const placeholderMessage = computed(() => (props.modelFit ? userMessages.modelFit.notFittedYet
            : userMessages.run.notRunYet));

        const plotStyle = computed(() => (props.fadePlot ? "opacity:0.5;" : ""));
        const solution = computed(() => (props.modelFit ? store.state.modelFit.solution
            : store.state.model.odinSolution));

        // mrc-3331 start time should always be zero.
        const startTime = computed(() => {
            return props.modelFit ? store.getters[`fitData/${FitDataGetter.dataStart}`] : 0;
        });
        const endTime = computed(() => {
            return props.modelFit ? store.getters[`fitData/${FitDataGetter.dataEnd}`] : store.state.model.endTime;
        });

        const palette = computed(() => store.state.model.paletteModel);

        const plot = ref<null | HTMLElement>(null); // Picks up the element with 'plot' ref in the template
        const baseData = ref<Data[]>([]);
        const nPoints = 1000; // TODO: appropriate value could be derived from width of element

        const hasPlotData = computed(() => !!(baseData.value?.length));

        const seriesColour = (variable: string) => ({ color: palette.value[variable] });

        const filterSeriesSet = (s: OdinSeriesSet, name: string): OdinSeriesSet => {
            const idx = s.names.indexOf(name);
            return {
                names: [s.names[idx]],
                x: s.x,
                y: [s.y[idx]]
            };
        };

        const odinToPlotly = (s: OdinSeriesSet): Partial<PlotData>[] => s.y.map(
            (el: number[], i: number): Partial<PlotData> => ({
                line: seriesColour(s.names[i]),
                name: s.names[i],
                x: s.x,
                y: s.y[i]
            })
        );

        // translate fit data into a form that can be plotted - only supported for modelFit for now
        const fitDataSeries = (start: number, end: number): Partial<PlotData>[] => {
            const { fitData } = store.state;
            const timeVar = fitData?.timeVariable;
            const dataVar = fitData?.columnToFit;
            if (props.modelFit && fitData.data && dataVar && timeVar) {
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
            let result = solution.value(start, end, nPoints);
            if (!result) {
                return [];
            }
            if (props.modelFit) {
                const { fitData } = store.state;
                const dataVar = fitData?.columnToFit;
                const modelVar = fitData.linkedVariables[dataVar];
                result = filterSeriesSet(result, modelVar);
            }
            return [...odinToPlotly(result), ...fitDataSeries(start, end)];
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
                baseData.value = allPlotData(startTime.value, endTime.value);

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
