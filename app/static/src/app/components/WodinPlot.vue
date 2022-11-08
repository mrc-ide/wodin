<template>
  <div class="wodin-plot-container" :style="plotStyle">
    <div class="plot" ref="plot">
    </div>
    <div v-if="!hasPlotData" class="plot-placeholder">
      {{ placeholderMessage }}
    </div>
    <div v-if="hasPlotData" hidden class="wodin-plot-data-summary">
      <div class="wodin-plot-data-summary-series" v-for="(data, index) in baseData" :key="index"
           :name="data.name"
           :count="data.x?.length"
           :x-min="Math.min(...data.x)"
           :x-max="Math.max(...data.x)"
           :y-min="Math.min(...data.y)"
           :y-max="Math.max(...data.y)"
           :mode="data.mode"
           :line-color="data.line?.color"
           :marker-color="data.marker?.color"
      ></div>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, ref, watch, onMounted, onUnmounted, PropType
} from "vue";
import { EventEmitter } from "events";
import {
    newPlot, react, PlotRelayoutEvent, Plots
} from "plotly.js-basic-dist-min";
import {
    WodinPlotData, fadePlotStyle, margin, config
} from "../plot";

export default defineComponent({
    name: "WodinPlot",
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
        const plotStyle = computed(() => (props.fadePlot ? fadePlotStyle : ""));

        const startTime = 0;

        const plot = ref<null | HTMLElement>(null); // Picks up the element with 'plot' ref in the template
        const baseData = ref<WodinPlotData>([]);
        const nPoints = 1000; // TODO: appropriate value could be derived from width of element

        const hasPlotData = computed(() => !!(baseData.value?.length));

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
            if (props.redrawWatches.length) {
                baseData.value = props.plotData(startTime, props.endTime, nPoints);

                if (hasPlotData.value) {
                    const el = plot.value as unknown;
                    const layout = {
                        margin
                    };

                    newPlot(el as HTMLElement, baseData.value, layout, config);
                    if (props.recalculateOnRelayout) {
                        (el as EventEmitter).on("plotly_relayout", relayout);
                    }
                    resizeObserver = new ResizeObserver(resize);
                    resizeObserver.observe(plot.value as HTMLElement);
                }
            }
        };

        onMounted(drawPlot);

        watch(() => props.redrawWatches, drawPlot);

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
