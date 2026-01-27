<template>
    <div class="wodin-plot-and-legend">
        <div class="wodin-plot-container" :style="plotStyle">
            <div class="plot" ref="plot" id="plot"></div>
            <wodin-plot-data-summary :data="baseData"></wodin-plot-data-summary>
            <slot></slot>
        </div>
        <wodin-legend :legendConfigs="legendConfigs" @legendClick="handleClick"/>
        <div v-if="!hasPlotData" class="plot-placeholder">
            {{ placeholderMessage }}
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, onMounted, PropType } from "vue";
import { useStore } from "vuex";
import { Metadata, WodinPlotData, fadePlotStyle } from "../plot";
import WodinPlotDataSummary from "./WodinPlotDataSummary.vue";
import { GraphsMutation, SetGraphConfigPayload } from "../store/graphs/mutations";
import { fitGraphId, GraphConfig } from "../store/graphs/state";
import { Chart, Scales, ZoomProperties } from "@reside-ic/skadi-chart";
import { AppState } from "@/store/appState/state";
import { tooltipCallback } from "@/utils";
import WodinLegend, { LegendConfig } from "./WodinLegend.vue";

export default defineComponent({
    name: "WodinPlot",
    components: { WodinPlotDataSummary, WodinLegend },
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

        const updateAxes = (zoomProperties: ZoomProperties) => {
            if (!zoomProperties) return;
            const newXYRanges = {
              xAxisRange: zoomProperties.x,
              yAxisRange: zoomProperties.eventType === "dblclick" && !props.graphConfig.settings.lockYAxis
                ? null
                : zoomProperties.y,
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

        const getLegendConfigs = (data: WodinPlotData) => {
          const ret: Record<string, LegendConfig> = {};
          const { lines, points } = data;
          lines.forEach(l => {
            const { name, color } = l.metadata!;
            if (name in ret) return;
            ret[name] = { color, type: "line", enabled: true };
          });
          points.forEach(p => {
            const { name, color } = p.metadata!;
            if (name in ret) return;
            ret[name] = { color, type: "point", enabled: true };
          });
          return ret;
        };

        const legendConfigs = ref<Record<string, LegendConfig>>(
          getLegendConfigs(baseData.value)
        );

        const handleClick = (name: string) => {
          const old = legendConfigs.value;
          old[name].enabled = !old[name].enabled;
          legendConfigs.value = { ...old };
          const filteredOutNames: string[] = [];
          Object.entries(legendConfigs.value).forEach(([name, config]) => {
            if (!config.enabled) filteredOutNames.push(name);
          });

          // need to do this again, do not use baseData, it causes a
          // slowdown because it deeply wraps the data in Vue's reactivity
          const maxXExtents = { start: startTime, end: props.endTime };
          const settings = props.graphConfig.settings;
          const xRange = settings.xAxisRange
            ? { start: settings.xAxisRange[0], end: settings.xAxisRange[1] }
            : maxXExtents;
          const data = props.plotData(xRange.start, xRange.end, nPoints);
          const filteredData: WodinPlotData = {
            lines: data.lines.filter(l => !filteredOutNames.includes(l.metadata!.name)),
            points: data.points.filter(p => !filteredOutNames.includes(p.metadata!.name))
          };
          drawSkadiChart(filteredData);
        };

        const autoscaledMaxExtentsY = ref<Scales["y"]>();

        const drawSkadiChart = (legendFilteredData: null | WodinPlotData = null) => {
            const maxXExtents = { start: startTime, end: props.endTime };
            const settings = props.graphConfig.settings;
            const xRange = settings.xAxisRange
              ? { start: settings.xAxisRange[0], end: settings.xAxisRange[1] }
              : maxXExtents;

            let data: WodinPlotData;
            if (legendFilteredData) {
                data = legendFilteredData;
            } else {
                data = props.plotData(xRange.start, xRange.end, nPoints);
                baseData.value = data;
                legendConfigs.value = getLegendConfigs(baseData.value);
            }

            const yRange = settings.yAxisRange
              ? { start: settings.yAxisRange[0], end: settings.yAxisRange[1] }
              : {};

            const currentRanges = {
              x: xRange,
              y: yRange
            };

            const skadiChart = new Chart<Metadata>({ logScale: { y: settings.logScaleYAxis } })
              .addAxes({ x: "Time" })
              .addGridLines()
              .addTraces(data.lines)
              .addScatterPoints(data.points)
              .addZoom({ lockAxis: settings.lockYAxis ? "y" : null })
              .makeResponsive()
              .addTooltips(tooltipCallback)
              .addCustomLifecycleHooks({ beforeZoom: updateAxes })
              .appendTo(plot.value!, { x: maxXExtents }, currentRanges);

            autoscaledMaxExtentsY.value = skadiChart.autoscaledMaxExtents.y;
        };

        onMounted(drawSkadiChart);

        watch(
          [() => props.redrawWatches, () => props.graphConfig],
          ([, newGraphConfig], [, oldGraphConfig]) => {
          if (plotStyle.value !== fadePlotStyle) {
            drawSkadiChart();
            // if a user locks the y axis then we have to store the y axis range that
            // the graph automatically calculates or an existing y axis range
            if (newGraphConfig.settings.lockYAxis && !oldGraphConfig.settings.lockYAxis) {
              const maxExtentsY = autoscaledMaxExtentsY.value!;
              const yRange = newGraphConfig.settings.yAxisRange
                || [maxExtentsY.start, maxExtentsY.end];
              store.commit(`graphs/${GraphsMutation.SetGraphConfig}`, {
                  id: props.graphConfig.id,
                  settings: { yAxisRange: yRange }
              } as SetGraphConfigPayload);
            }
          }
        });

        return {
            plotStyle,
            plot,
            baseData,
            hasPlotData,
            updateAxes,
            legendConfigs,
            handleClick,
        };
    }
});
</script>
