<template>
  <div class="wodin-plot-container" :style="plotStyle">
    <div class="plot" ref="plot" id="plot">
    </div>
    <div v-if="!hasPlotData" class="plot-placeholder">
      {{ placeholderMessage }}
    </div>
    <wodin-plot-data-summary :data="baseData"></wodin-plot-data-summary>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, ref, watch, onMounted, onUnmounted, PropType
} from "vue";
import { useStore } from "vuex";
import { EventEmitter } from "events";
import {
    newPlot, react, PlotRelayoutEvent, Plots, AxisType, Layout, Config
} from "plotly.js-basic-dist-min";
import {
    WodinPlotData, fadePlotStyle, margin, config
} from "../plot";
import WodinPlotDataSummary from "./WodinPlotDataSummary.vue";
import { GraphSettingsMutation } from "../store/graphSettings/mutations";
import { AxesRange } from "../store/graphSettings/state";

export default defineComponent({
    name: "WodinPlot",
    components: { WodinPlotDataSummary },
    props: {
        fadePlot: Boolean,
        placeholderMessage: String,
        endTime: {
            type: Number,
            required: true
        },
        plotData: {
            type: Function as PropType<(start: number, end: number, points: number) => WodinPlotData>,
            required: true
        },
        // Only used as an indicator that redraw is required when this changes - the data to display is calculated by
        // plotData function using these solutions
        redrawWatches: {
            type: Array as PropType<any[]>,
            required: true
        },
        recalculateOnRelayout: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    setup(props) {
        const store = useStore();

        const plotStyle = computed(() => (props.fadePlot ? fadePlotStyle : ""));

        const startTime = 0;

        const plot = ref<null | HTMLElement>(null); // Picks up the element with 'plot' ref in the template
        const baseData = ref<WodinPlotData>([]);
        const nPoints = 1000; // TODO: appropriate value could be derived from width of element

        const hasPlotData = computed(() => !!(baseData.value?.length));

        const yAxisType = computed(() => (store.state.graphSettings.logScaleYAxis ? "log" : "linear" as AxisType));
        const lockAxes = computed(() => store.state.graphSettings.lockAxes);
        const axesRange = computed(() => store.state.graphSettings.axesRange as AxesRange);

        const updateAxesRange = () => {
            const plotObj = document.getElementById("plot") as any;
            const yRange = plotObj.layout?.yaxis?.range;
            const xRange = plotObj.layout?.xaxis?.range;
            const range = { x: xRange, y: yRange };
            if (plotObj) {
                store.commit(`graphSettings/${GraphSettingsMutation.SetAxesRange}`, range);
            }
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
                data = props.plotData(t0, t1, nPoints);
            }

            const layout: Partial<Layout> = {
                margin,
                uirevision: "true",
                xaxis: { title: "Time", autorange: true },
                yaxis: { autorange: true, type: yAxisType.value }
            };

            const el = plot.value as HTMLElement;
            await react(el, data, layout, config);

            updateAxesRange();
        };

        const resize = () => {
            if (plot.value) {
                Plots.resize(plot.value as HTMLElement);
            }
        };

        let resizeObserver: null | ResizeObserver = null;

        const drawPlot = (toggleLogScale = false) => {
            if (props.redrawWatches.length) {
                baseData.value = props.plotData(startTime, props.endTime, nPoints);

                if (hasPlotData.value) {
                    const el = plot.value as unknown;
                    const layout: Partial<Layout> = {
                        margin,
                        yaxis: {
                            type: yAxisType.value
                        },
                        xaxis: { title: "Time" }
                    };

                    const configCopy = { ...config } as Partial<Config>;

                    if (lockAxes.value && !toggleLogScale) {
                        // removing ability to zoom in
                        layout.yaxis!.range = axesRange.value.y;
                        layout.xaxis!.range = axesRange.value.x;
                        layout.yaxis!.fixedrange = true;
                        layout.xaxis!.fixedrange = true;
                    }

                    newPlot(el as HTMLElement, baseData.value, layout, configCopy);

                    updateAxesRange();

                    if (props.recalculateOnRelayout) {
                        (el as EventEmitter).on("plotly_relayout", relayout);
                    }
                    resizeObserver = new ResizeObserver(resize);
                    resizeObserver.observe(plot.value as HTMLElement);
                }
            }
        };

        onMounted(drawPlot);

        watch([() => props.redrawWatches, lockAxes], () => drawPlot());
        watch(yAxisType, () => drawPlot(true));

        onUnmounted(() => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        });

        return {
            plotStyle,
            plot,
            relayout,
            resize,
            baseData,
            hasPlotData
        };
    }
});
</script>
