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
    Data, newPlot, react, PlotRelayoutEvent, Plots
} from "plotly.js";
import { FitDataGetter } from "../../store/fitData/getters";
import userMessages from "../../userMessages";
import { Dict } from "../../types/utilTypes";
// import { paletteData, paletteModel } from "../../colours;"

// import interpolate from "color-interpolate";

export function parseColour(col: string): number[] {
    const r = parseInt(col.slice(1, 3), 16) / 255;
    const g = parseInt(col.slice(3, 5), 16) / 255;
    const b = parseInt(col.slice(5, 7), 16) / 255;
    return [r, g, b];
}

export function rgb(r: number, g: number, b: number): string {
    const roundcolour = (x: number) =>
        Math.round(Math.max(Math.min(x, 1), 0) * 255).toString(16);
    return `#${roundcolour(r)}${roundcolour(g)}${roundcolour(b)}`;
}

// TODO: cope with single colour case, I think it fails?
export function palette(pal: string[], len: number) {
    const cols = pal.map(parseColour);
    return (i: number): string => {
        const idx = i / (len - 1) * (cols.length - 1);
        const lo = Math.floor(idx);
        const p = idx % 1;
        if (lo >= cols.length - 1) {
            return pal[cols.length - 1];
        }
        if (p === 0) {
            return pal[lo];
        }
        const r = cols[lo][0] * (1 - p) + cols[lo + 1][0] * p;
        const g = cols[lo][1] * (1 - p) + cols[lo + 1][1] * p;
        const b = cols[lo][2] * (1 - p) + cols[lo + 1][2] * p;
        return rgb(r, g, b);
    }
}

function paletteModel(n: number) {
    const cols = ["#2e5cb8", "#39ac73", "#cccc00", "#ff884d", "#cc0044"];
    return palette(cols, n);
}

function paletteData(n: number) {
    // First few of these used, derived from ColorBrewer set 1
    const cols = ["#E41A1C", "#377EB8", "#4DAF4A", "#984EA3", "#FF7F00", "#FFFF33", "#A65628", "#F781BF"];
    return (i: number): string => cols[i];
}

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

        const startTime = computed(() => {
            return props.modelFit ? store.getters[`fitData/${FitDataGetter.dataStart}`] : 0;
        });
        const endTime = computed(() => {
            return props.modelFit ? store.getters[`fitData/${FitDataGetter.dataEnd}`] : store.state.model.endTime;
        });

        const plot = ref<null | HTMLElement>(null); // Picks up the element with 'plot' ref in the template
        const baseData = ref<Data[]>([]);
        const nPoints = 1000; // TODO: appropriate value could be derived from width of element

        const hasPlotData = computed(() => !!(baseData.value?.length));

        // translate fit data into a form that can be plotted - only supported for modelFit for now
        const fitDataSeries = (start: number, end: number) => {
            const { fitData } = store.state;
            const timeVar = fitData?.timeVariable;
            if (props.modelFit && fitData.data && fitData.columnToFit && timeVar) {
                const filteredData = fitData.data.filter(
                    (row: Dict<number>) => row[timeVar] >= start && row[timeVar] <= end
                );
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

        const allPlotData = (start: number, end: number): Data[] => {
            let dataToPlot = solution.value(start, end, nPoints);
            if (!dataToPlot) {
                return [];
            }

            // model fit partial solution returns single series - convert to array
            if (props.modelFit) {
                dataToPlot = [dataToPlot] as Data[];
            }
            return [...dataToPlot, ...fitDataSeries(start, end)];
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
