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
import { computed, defineComponent, ref, watch, onMounted, PropType } from "vue";
import { useStore } from "vuex";
import { Metadata, WodinPlotData, fadePlotStyle } from "../plot";
import WodinPlotDataSummary from "./WodinPlotDataSummary.vue";
import { GraphsMutation, SetGraphConfigPayload } from "../store/graphs/mutations";
import { fitGraphId, GraphConfig } from "../store/graphs/state";
import { Chart, ZoomExtents } from "skadi-chart";
import { AppState } from "@/store/appState/state";
import { tooltipCallback } from "@/utils";

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
        graphConfig: {
            type: Object as PropType<GraphConfig>,
            required: true
        },
        isLastGraph: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    setup(props) {
        const store = useStore<AppState>();

        const plotStyle = computed(() => (props.fadePlot ? fadePlotStyle : ""));
        const startTime = 0;

        const plot = ref<null | HTMLDivElement>(null); // Picks up the element with 'plot' ref in the template
        const baseData = ref<WodinPlotData>({ lines: [], points: [] });
        const nPoints = 1000; // TODO: appropriate value could be derived from width of element

        const hasPlotData = computed(() => !!baseData.value.lines.length || !!baseData.value.points.length);

        const updateAxes = (zoomExtents: ZoomExtents) => {
            if (!zoomExtents) return;
            const newXYRanges = {
              xAxisRange: zoomExtents.x,
              yAxisRange: zoomExtents.eventType === "dblclick" && !props.graphConfig.settings.lockYAxis ? null : zoomExtents.y,
            };

            if (props.graphConfig.id === fitGraphId) {
              store.commit(`graphs/${GraphsMutation.SetGraphConfig}`, {
                id: fitGraphId,
                settings: { ...newXYRanges }
              } as SetGraphConfigPayload);
            } else {
              const allGraphConfigs = store.state.graphs.config;
              const allUpdatedConfigs = allGraphConfigs.map(cfg => ({
                ...cfg,
                settings: {
                  ...cfg.settings,
                  xAxisRange: newXYRanges.xAxisRange,
                  yAxisRange: cfg.id === props.graphConfig.id
                    ? newXYRanges.yAxisRange
                    : cfg.settings.yAxisRange
                }
              }));
              store.commit(
                `graphs/${GraphsMutation.SetAllGraphConfigs}`,
                JSON.parse(JSON.stringify(allUpdatedConfigs))
              );
            }
        };

        const skadiChart = ref<Chart>();

        const drawSkadiChart = () => {
            const xAxisTitle = props.isLastGraph ? "Time" : "";
            const maxXExtents = { start: startTime, end: props.endTime };
            const settings = props.graphConfig.settings;
            const xRange = settings.xAxisRange
              ? { start: settings.xAxisRange[0], end: settings.xAxisRange[1] }
              : maxXExtents;
            const data = props.plotData(xRange.start, xRange.end, nPoints);
            baseData.value = data;

            const yRange = settings.yAxisRange
              ? { start: settings.yAxisRange[0], end: settings.yAxisRange[1] }
              : {};

            const currentRanges = {
              x: xRange,
              y: yRange
            };

            if (!data.lines.length && !data.points.length) return;
            skadiChart.value = new Chart<Metadata>({ logScale: { y: settings.logScaleYAxis } })
              .addAxes({ x: xAxisTitle })
              .addGridLines()
              .addTraces(data.lines)
              .addScatterPoints(data.points)
              .addZoom({ lockAxis: settings.lockYAxis ? "y" : null })
              .makeResponsive()
              .addTooltips(tooltipCallback)
              .addCustomLifecycleHooks({ beforeZoom: updateAxes })
              .appendTo(plot.value!, { x: maxXExtents }, currentRanges);
        };

        onMounted(drawSkadiChart);

        watch([() => props.redrawWatches, () => props.graphConfig], () => {
          if (plotStyle.value !== fadePlotStyle) {
            drawSkadiChart();
          }
        });

        return {
            plotStyle,
            plot,
            baseData,
            hasPlotData
        };
    }
});
</script>
