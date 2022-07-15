<template>
    <div :style="plotStyle">
      <div class="run-model-plot" ref="plot">
      </div>
      <div v-if="!baseData.length" class="plot-placeholder">
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
    Data, newPlot, react, PlotRelayoutEvent, Plots
} from "plotly.js";
import { FitDataGetter } from "../../store/fitData/getters";
import userMessages from "../../userMessages";
import { Dict } from "../../types/utilTypes";

export default defineComponent({
    name: "RunModelPlot",
    props: {
        fadePlot: Boolean,
        modelFit: Boolean
    },
    setup(props) {
        const store = useStore();

        const placeholderMessage = computed(() => (props.modelFit ? userMessages.modelFit.notFittedYet : userMessages.run.notRunYet));

        const plotStyle = computed(() => (props.fadePlot ? "opacity:0.5;" : ""));
        const solution = computed(() => (props.modelFit ? store.state.modelFit.solution : store.state.model.odinSolution));

        const startTime = computed(() => {
            return props.modelFit ? store.getters[`fitData/${FitDataGetter.dataStart}`] : 0;
        });
        const endTime = computed(() => {
            return props.modelFit ? store.getters[`fitData/${FitDataGetter.dataEnd}`] : store.state.model.endTime;
        });

        const plot = ref<null | HTMLElement>(null); // Picks up the element with 'plot' ref in the template
        const baseData = ref<Data[]>([]);

        // translate fit data into a form that can be plotted - only supported for modelFit for now
        const fitDataSeries = (start: number, end: number) => {
            const { fitData } = store.state;
            const timeVar = fitData.timeVariable;
            if (props.modelFit && fitData.data && fitData.columnToFit && timeVar) {
                const filteredData = fitData.data.filter((row: Dict<number>) => row[timeVar] >= start && row[timeVar] <= end);
                return [{
                    name: fitData.columnToFit,
                    x: filteredData.map((row: Dict<number>) => row[fitData.timeVariable!]),
                    y: filteredData.map((row: Dict<number>) => row[fitData.columnToFit!]),
                    mode: "markers",
                    type: "scatter"

                }];
            }
            return [];
        };

        const nPoints = 1000; // TODO: appropriate value could be derived from width of element

        const allPlotData = (start: number, end: number): Data[] => {
            let dataToPlot = solution.value(startTime.value, endTime.value, nPoints);

            // model fit partial solution returns single series - convert to array
            if (props.modelFit) {
                dataToPlot = [dataToPlot] as Data[];
            }

            return [...dataToPlot, ...fitDataSeries(start, end)];
        };

        const config = {
            responsive: true
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

                if (baseData.value.length) {
                    const el = plot.value as unknown;
                    const layout = {
                        margin: { t: 0 }
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
            baseData
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
