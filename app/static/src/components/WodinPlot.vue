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
import { computed, defineComponent, ref, watch, onMounted, onUnmounted, PropType, Ref } from "vue";
import { useStore } from "vuex";
import EventEmitter from "events";
import {
    newPlot,
    react,
    PlotRelayoutEvent,
    Plots,
    AxisType,
    Layout,
    Config,
    LayoutAxis,
    PlotlyHTMLElement
} from "plotly.js-basic-dist-min";
import { WodinPlotData, fadePlotStyle, margin, config } from "../plot";
import WodinPlotDataSummary from "./WodinPlotDataSummary.vue";
import { GraphsMutation } from "../store/graphs/mutations";
import { GraphConfig, YAxisRange } from "../store/graphs/state";
import { GraphsGetter } from "../store/graphs/getters";

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
            type: Array as PropType<unknown[]>,
            required: true
        },
        recalculateOnRelayout: {
            type: Boolean,
            required: false,
            default: true
        },
        linkedXAxis: {
            type: Object as PropType<Partial<LayoutAxis> | null>,
            required: false,
            default: null
        },
        graphIndex: {
            type: Number,
            required: false,
            default: -1
        },
        // We could look up graphConfig from graphIndex - however this causes a specific reactivity bug
        // when the last plot is deleted and the plot tries to observe the old maximum index before it is updated.
        graphConfig: {
            type: Object as PropType<GraphConfig | null>,
            required: true
        },
        fitPlot: {
            type: Boolean,
            required: true
        }
    },
    emits: ["updateXAxis"],
    setup(props, { emit }) {
        const store = useStore();

        const plotStyle = computed(() => (props.fadePlot ? fadePlotStyle : ""));

        const startTime = 0;

        const plot = ref<null | PlotlyHTMLElement>(null); // Picks up the element with 'plot' ref in the template
        const baseData = ref<WodinPlotData>([]);
        const nPoints = 1000; // TODO: appropriate value could be derived from width of element

        const hasPlotData = computed(() => !!baseData.value?.length);

        const settings = computed(() =>
            props.fitPlot ? store.state.graphs.fitGraphSettings : props.graphConfig!.settings
        );
        const yAxisType = computed(() => (settings.value.logScaleYAxis ? "log" : ("linear" as AxisType)));
        const lockYAxis = computed(() => settings.value.lockYAxis);
        const yAxisRange = computed(() => settings.value.yAxisRange as YAxisRange);
        const legendWidth = computed(() => store.getters[`graphs/${GraphsGetter.legendWidth}`]);

        // Remember the user's last y axis zoom, when we update from x axis potentially chosen in another graph
        const lastYAxisFromZoom: Ref<Partial<LayoutAxis> | null> = ref(null);

        const commitYAxisRange = () => {
            const plotLayout = plot.value!.layout;
            const yRange = plotLayout.yaxis?.range;
            if (plotLayout) {
                if (props.fitPlot) {
                    store.commit(`graphs/${GraphsMutation.SetFitYAxisRange}`, yRange);
                } else {
                    store.commit(`graphs/${GraphsMutation.SetYAxisRange}`, {
                        graphIndex: props.graphIndex,
                        value: yRange
                    });
                }
            }
        };

        const defaultLayout = (): Partial<Layout> => {
            // Get generic layout, which will be modifed dynamically as required
            // Show Time label on final graph only
            const xAxisTitle = props.fitPlot || props.graphIndex === store.state.graphs.config.length - 1 ? "Time" : "";
            const result = {
                margin: { ...margin },
                xaxis: { title: xAxisTitle },
                yaxis: { type: yAxisType.value }
            };
            if (legendWidth.value) {
                result.margin.r = legendWidth.value;
            }
            return result;
        };

        const preserveYAxisRange = (layout: Partial<Layout>): Partial<Layout> => {
            // When updating plot view in response to some data change or event, retain Y axis range in layout
            // either from the locked range, or from the last range user zoomed to.
            // (Locked range will survive re-mount and tab change, the last range from zoom will not)
            const result = { ...layout };
            if (lockYAxis.value) {
                result.yaxis = {
                    ...result.yaxis,
                    range: [...yAxisRange.value],
                    autorange: false
                };
            } else if (lastYAxisFromZoom.value) {
                result.yaxis = {
                    ...result.yaxis,
                    ...lastYAxisFromZoom.value
                };
            }
            return result;
        };

        const updateXAxisRange = async (xAxis: Partial<LayoutAxis>) => {
            let data;
            if (xAxis.autorange) {
                data = baseData.value;
            } else {
                data = props.plotData(xAxis.range![0], xAxis.range![1], nPoints);
            }

            const layout = preserveYAxisRange(defaultLayout());

            const el = plot.value as HTMLElement;
            await react(el, data, layout, config);
        };

        const axisFromEvent = (event: PlotRelayoutEvent, axisLetter: "x" | "y"): Partial<LayoutAxis> => {
            return {
                autorange: event[`${axisLetter}axis.autorange`] || false,
                range: [event[`${axisLetter}axis.range[0]`], event[`${axisLetter}axis.range[1]`]]
            };
        };

        const relayout = async (event: PlotRelayoutEvent) => {
            if (event["xaxis.autorange"] || (event["xaxis.range[0]"] && event["xaxis.range[1]"])) {
                const xAxis = axisFromEvent(event, "x");
                if (props.linkedXAxis) {
                    // Emit the x axis change, and handle update when options are propagated through prop
                    emit("updateXAxis", xAxis);
                } else {
                    // No linked x axis, so this plot can just update itself directly
                    await updateXAxisRange(xAxis);
                }
            }

            if (event["yaxis.autorange"] || (event["yaxis.range[0]"] && event["yaxis.range[1]"])) {
                lastYAxisFromZoom.value = axisFromEvent(event, "y");
            }
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
                    let layout = defaultLayout();
                    if (!toggleLogScale) {
                        layout = preserveYAxisRange(layout);
                    }
                    const configCopy = { ...config } as Partial<Config>;

                    let data;
                    if (!props.linkedXAxis || props.linkedXAxis.autorange) {
                        data = baseData.value;
                    } else {
                        data = props.plotData(props.linkedXAxis.range![0], props.linkedXAxis.range![1], nPoints);
                    }

                    newPlot(el as HTMLElement, data, layout, configCopy);

                    // We're not locking the YAxis OR we are toggling the log scale (overriding any locked range)
                    // so commit whatever Y axis range the plot auto-calculates, so we can lock to that in future
                    // if the user chooses
                    if (!lockYAxis.value || toggleLogScale) {
                        commitYAxisRange();
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
        watch(
            () => props.linkedXAxis,
            () => {
                if (props.linkedXAxis) {
                    updateXAxisRange(props.linkedXAxis);
                }
            }
        );

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
