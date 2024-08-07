<template>
    <div class="wodin-plot-container" :style="plotStyle">
        <div class="plot" ref="plot" id="plot"></div>
        <div v-if="!hasPlotData" class="plot-placeholder">
            {{ placeholderMessage }}
        </div>
        <wodin-plot-data-summary :data="baseData"></wodin-plot-data-summary>
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, onMounted, onUnmounted, PropType } from "vue";
import { useStore } from "vuex";
import { EventEmitter } from "events";
import { newPlot, react, PlotRelayoutEvent, Plots, AxisType, Layout, Config } from "plotly.js-basic-dist-min";
import { WodinPlotData, fadePlotStyle, margin, config } from "../plot";
import WodinPlotDataSummary from "./WodinPlotDataSummary.vue";
import { GraphsMutation } from "../store/graphs/mutations";
import { YAxisRange } from "../store/graphs/state";

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

        const hasPlotData = computed(() => !!baseData.value?.length);

        const yAxisType = computed(() => (store.state.graphs.settings.logScaleYAxis ? "log" : ("linear" as AxisType)));
        const lockYAxis = computed(() => store.state.graphs.settings.lockYAxis);
        const yAxisRange = computed(() => store.state.graphs.settings.yAxisRange as YAxisRange);

        const updateAxesRange = () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const plotLayout = (plot.value as any).layout;
            const yRange = plotLayout.yaxis?.range;
            if (plotLayout) {
                store.commit(`graphs/${GraphsMutation.SetYAxisRange}`, yRange);
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

                    if (lockYAxis.value && !toggleLogScale) {
                        layout.yaxis!.range = [...yAxisRange.value];
                        layout.yaxis!.autorange = false;
                    }

                    newPlot(el as HTMLElement, baseData.value, layout, configCopy);

                    if (!lockYAxis.value || toggleLogScale) {
                        updateAxesRange();
                    }

                    if (props.recalculateOnRelayout) {
                        (el as EventEmitter).on("plotly_relayout", relayout);
                    }
                    resizeObserver = new ResizeObserver(resize);
                    resizeObserver.observe(plot.value as HTMLElement);
                }
            }
        };

        onMounted(drawPlot);

        watch([() => props.redrawWatches, lockYAxis], () => {
            if (plotStyle.value !== fadePlotStyle) {
                drawPlot();
            }
        });
        watch(yAxisType, () => {
            if (plotStyle.value !== fadePlotStyle) {
                drawPlot(true);
            }
        });

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
