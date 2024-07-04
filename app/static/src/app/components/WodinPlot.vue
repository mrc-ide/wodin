<template>
    <div class="wodin-plot-container" :style="plotStyle">
        <div>{{JSON.stringify(linkedXAxisOptions)}}</div>
        <div class="plot" ref="plot" id="plot"></div>
        <div v-if="!hasPlotData" class="plot-placeholder">
            {{ placeholderMessage }}
        </div>
        <wodin-plot-data-summary :data="baseData"></wodin-plot-data-summary>
        <slot></slot>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref, watch, onMounted, onUnmounted, PropType, Ref} from "vue";
import { useStore } from "vuex";
import { EventEmitter } from "events";
import { newPlot, react, PlotRelayoutEvent, Plots, AxisType, Layout, Config } from "plotly.js-basic-dist-min";
import { WodinPlotData, fadePlotStyle, margin, config } from "../plot";
import WodinPlotDataSummary from "./WodinPlotDataSummary.vue";
import { GraphsMutation } from "../store/graphs/mutations";
import { YAxisRange } from "../store/graphs/state";
import {GraphsGetter} from "../store/graphs/getters";

export interface AxisOptions {
    autorange: boolean;
    min?: number;
    max?: number;
}

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
        },
        hasLinkedXAxis: {
            type: Boolean,
            required: false,
            default: false
        },
        linkedXAxisOptions: {
            type: Object as PropType<AxisOptions | null>,
            required: false,
            default: null
        }
    },
    emits: ["updateXAxis"],
    setup(props, { emit }) {
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
        const legendWidth = computed(() => store.getters[`graphs/${GraphsGetter.legendWidth}`]);

        const lastYAxisOptionsFromZoom: Ref<AxisOptions | null> = ref(null);

        const commitYAxisRange = () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const plotLayout = (plot.value as any).layout;
            const yRange = plotLayout.yaxis?.range;
            if (plotLayout) {
                // TODO: We do not yet have per-graph settings, so YAxisRange committed here and used when user chooses
                // to lock range will be overwritten by each graph, and will
                store.commit(`graphs/${GraphsMutation.SetYAxisRange}`, yRange);
            }
        };

        const updateXAxisRange = async (xAxisOptions: AxisOptions) => {

            let data;
            if (xAxisOptions.autorange) {
                data = baseData.value;
            } else {
                data = props.plotData(xAxisOptions.min!, xAxisOptions.max!, nPoints);
            }
            console.log(`Legend width is ${legendWidth.value}`);

            //const plotLayout = (plot.value as any).layout;
            //alert("updating xaxis with " + JSON.stringify(plotLayout.yaxis))
            const layout: Partial<Layout> = {
                margin: {...margin, r: legendWidth.value},
                uirevision: "true",
                xaxis: { title: "Time", autorange: true },
                yaxis: { autorange: true, type: yAxisType.value }
            };

            // mrc-5485 - removed from above layout:
            // ,
            //  yaxis: { autorange: true, type: yAxisType.value }

            // mrc-5484
            /*if (lockYAxis.value) {
                layout.yaxis!.range = [...yAxisRange.value];
                layout.yaxis!.autorange = false;
            } else if (lastYAxisOptionsFromZoom.value) {
                layout.yaxis!.autorange = lastYAxisOptionsFromZoom.value.autorange;
                layout.yaxis!.range = [lastYAxisOptionsFromZoom.value.min, lastYAxisOptionsFromZoom.value.max];
            }*/
            retainYAxisRange(layout);

            const el = plot.value as HTMLElement;
            await react(el, data, layout, config);
        };

        const retainYAxisRange = (layout: Partial<Layout>) => {
            // When updating plot view in response to some data change or event, retain Y axis range in layout
            // either from the locked range, or from the last range user zoomed to.
            // (Locked range will survive re-mount and tab change, the last range from zoom will not)
            if (lockYAxis.value) {
              layout.yaxis!.range = [...yAxisRange.value];
              layout.yaxis!.autorange = false;
            } else if (lastYAxisOptionsFromZoom.value) {
              layout.yaxis!.autorange = lastYAxisOptionsFromZoom.value.autorange;
              layout.yaxis!.range = [lastYAxisOptionsFromZoom.value.min, lastYAxisOptionsFromZoom.value.max];
            }
        };

        const relayout = async (event: PlotRelayoutEvent) => {
            //alert("RELAYOUT! " + JSON.stringify(event))
            if (event["xaxis.autorange"] || event["xaxis.range[0]"]) {
                let xAxisOptions;
                if (event["xaxis.autorange"] === true) {
                  xAxisOptions = {autorange: true};
                } else {
                  const t0 = event["xaxis.range[0]"];
                  const t1 = event["xaxis.range[1]"];
                  xAxisOptions = {
                    autorange: false,
                    min: t0,
                    max: t1
                  };
                }
                if (props.hasLinkedXAxis) {
                  // Emit the x axis change, and handle update when options are propagated through prop
                  emit("updateXAxis", xAxisOptions);
                } else {
                  // No linked x axis, so this plot can just update itself directly
                  await updateXAxisRange(xAxisOptions);
                }
            }

          if (event["yaxis.autorange"] || event["yaxis.range[0]"]) {
              lastYAxisOptionsFromZoom.value = {
                autorange: event["yaxis.autorange"] || false,
                min: event["yaxis.range[0]"],
                max: event["yaxis.range[1]"]
              };
            }
        };

        const resize = () => {
            if (plot.value) {
                Plots.resize(plot.value as HTMLElement);
            }
        };

        let resizeObserver: null | ResizeObserver = null;

        /*const getLayout = (toggleLogScale: boolean) => {
            return {
              margin: {
                  ...margin,
                  r: legendWidth.value
              },
              yaxis: {
                type: yAxisType.value
              },
              xaxis: { title: "Time" }
            };
        };*/

        const drawPlot = (toggleLogScale = false) => {
            console.log("redrawing..");
            if (props.redrawWatches.length) {
                baseData.value = props.plotData(startTime, props.endTime, nPoints);

                if (hasPlotData.value) {
                    const el = plot.value as unknown;
                    // TODO: build margin in a nicer way!
                    console.log(`Legend width is ${legendWidth.value}`);
                    const layout: Partial<Layout> = {
                        margin: {...margin, r: legendWidth.value},
                        yaxis: {
                            type: yAxisType.value
                        },
                        xaxis: { title: "Time" }
                    };

                    const configCopy = { ...config } as Partial<Config>;

                    /*if (lockYAxis.value && !toggleLogScale) {
                        // We're configured to lock the y axis and we're not in the process of toggling the
                        // log scale, so lock the y axis range
                        layout.yaxis!.range = [...yAxisRange.value];
                        layout.yaxis!.autorange = false;
                    }*/
                    if (!toggleLogScale) {
                      retainYAxisRange(layout);
                    }

                    // mrc-5484 - set data appropriate to xAxisOptions
                    let data;
                    if (!props.linkedXAxisOptions || props.linkedXAxisOptions.autorange) {
                      data = baseData.value;
                    } else {
                      data = props.plotData(props.linkedXAxisOptions.min!, props.linkedXAxisOptions.max!, nPoints);
                    }

                    //newPlot(el as HTMLElement, baseData.value, layout, configCopy);
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
                //alert("drawing plot from redrawWatches or lockYAxis")
                drawPlot();
            }
        });
        watch(yAxisType, () => {
            if (plotStyle.value !== fadePlotStyle) {
                //alert("drawing plot from yAxisType")
                drawPlot(true);
            }
        });
        watch(() => props.linkedXAxisOptions, () => {
          if (props.linkedXAxisOptions) {
            updateXAxisRange(props.linkedXAxisOptions);
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
