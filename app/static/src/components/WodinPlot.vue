<template>
    <div class="wodin-plot-and-legend">
        <div class="wodin-plot-container" :style="plotStyle">
            <div class="plot" ref="plot" id="plot"></div>
            <wodin-plot-data-summary v-if="DATA_SUMMARY" :data="baseData"></wodin-plot-data-summary>
            <slot></slot>
        </div>
        <wodin-legend :legendConfigs="legendConfigs" @legendClick="handleClick"/>
        <div v-if="!hasPlotData" class="plot-placeholder">
            {{ placeholderMessage }}
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, onMounted, PropType, shallowRef } from "vue";
import { useStore } from "vuex";
import { fadePlotStyle } from "../plot";
import WodinPlotDataSummary from "./WodinPlotDataSummary.vue";
import { GraphsAction, UpdateGraphPayload } from "../store/graphs/actions";
import { FitGraph, fitGraphId, FitGraphType, FitGraphTypeValue, GraphType, Metadata, NonFitGraph, NonFitGraphType, NonFitGraphTypeValue, WodinPlotData } from "../store/graphs/state";
import { Chart, Scales, ZoomProperties } from "@reside-ic/skadi-chart";
import { AppState, VisualisationTab } from "@/store/appState/state";
import { runPlaceholderMessage, tooltipCallback } from "@/utils";
import WodinLegend, { LegendConfig } from "./WodinLegend.vue";
import userMessages from "@/userMessages";
import { DATA_SUMMARY } from "@/parseEnv";

export default defineComponent({
    name: "WodinPlot",
    components: { WodinPlotDataSummary, WodinLegend },
    props: {
        fadePlot: Boolean,
        type: {
            type: String as PropType<GraphType>,
            required: true
        },
        id: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const store = useStore<AppState>();

        const graph = computed(() => {
            const { graphs } = store.state;
            if (props.id === fitGraphId) {
                return graphs.fitGraph;
            } else {
                return graphs.graphs.find(g => g.id === props.id)!;
            }
        });

        const placeholderMessage = computed(() => {
          if (store.state.openVisualisationTab === VisualisationTab.Fit) {
            return userMessages.modelFit.notFittedYet;
          }

          return runPlaceholderMessage(
            graph.value.config.selectedVariables,
            store.state.openVisualisationTab === VisualisationTab.Sensitivity
          )
        });

        const plotStyle = computed(() => (props.fadePlot ? fadePlotStyle : ""));

        const plot = ref<null | HTMLDivElement>(null); // Picks up the element with 'plot' ref in the template
        const baseData = shallowRef<WodinPlotData>({ lines: [], points: [] });

        const hasPlotData = computed(() => !!baseData.value.lines.length || !!baseData.value.points.length);

        const updateAxes = (zoomProperties: ZoomProperties) => {
            if (!zoomProperties) return;
            const newXYRanges = {
              xAxisRange: zoomProperties.x,
              yAxisRange: zoomProperties.eventType === "dblclick" && !graph.value.config.lockYAxis
                ? null
                : zoomProperties.y,
            };

            if (graph.value.id === fitGraphId) {
              store.dispatch(`graphs/${GraphsAction.UpdateGraph}`, {
                id: fitGraphId,
                config: { ...newXYRanges }
              } as UpdateGraphPayload);
            } else {
              const allGraphs = store.state.graphs.graphs;
              const allUpdatedGraphs = allGraphs.map(g => ({
                id: g.id,
                config: {
                  ...g.config,
                  xAxisRange: newXYRanges.xAxisRange,
                  yAxisRange: g.id === graph.value.id
                    ? newXYRanges.yAxisRange
                    : g.config.yAxisRange
                }
              }));
              store.dispatch(
                `graphs/${GraphsAction.UpdateAllNonFitGraphs}`,
                JSON.parse(JSON.stringify(allUpdatedGraphs))
              );
            }
        };

        const getLegendConfigs = (data: WodinPlotData) => {
          const ret: Record<string, LegendConfig> = {};
          const { lines, points } = data;
          lines.forEach(l => {
            const { name, color } = l.metadata!;
            if (name in ret) return;
            ret[name] = { color, type: "line", faded: false };
          });
          points.forEach(p => {
            const { name, color } = p.metadata!;
            if (name in ret) return;
            ret[name] = { color, type: "point", faded: false };
          });
          return ret;
        };

        const legendConfigs = ref<Record<string, LegendConfig>>(
          getLegendConfigs(baseData.value)
        );

        const handleClick = (name: string) => {
          const old = legendConfigs.value;
          old[name].faded = !old[name].faded;
          legendConfigs.value = { ...old };
          const filteredOutNames: string[] = [];
          Object.entries(legendConfigs.value).forEach(([name, config]) => {
            if (config.faded) filteredOutNames.push(name);
          });

          const filteredData: WodinPlotData = {
            lines: baseData.value.lines.filter(l => !filteredOutNames.includes(l.metadata!.name)),
            points: baseData.value.points.filter(p => !filteredOutNames.includes(p.metadata!.name))
          };
          drawSkadiChart(filteredData);
        };

        const autoscaledMaxExtentsY = ref<Scales["y"]>();

        const drawSkadiChart = (legendFilteredData: null | WodinPlotData = null) => {
            const { config } = graph.value;

            let graphData: WodinPlotData;
            if (props.id === fitGraphId) {
                const type = props.type as FitGraphTypeValue;
                const g = graph.value as FitGraph;
                graphData = g[`${type}Data`];
            } else {
                const type = props.type as NonFitGraphTypeValue;
                const g = graph.value as NonFitGraph;
                graphData = g[`${type}Data`];
            }

            const maxXExtents = { start: 0, end: store.state.run.endTime };
            const xRange = config.xAxisRange
              ? { start: config.xAxisRange[0], end: config.xAxisRange[1] }
              : maxXExtents;
            const yRange = config.yAxisRange
              ? { start: config.yAxisRange[0], end: config.yAxisRange[1] }
              : {};

            // TODO make x axis label the varying parameter!!
            const isSensitivitySummary = ([
                NonFitGraphType.SensitivityValueAtTime,
                NonFitGraphType.SensitivityTimeAtExtreme,
                NonFitGraphType.SensitivityValueAtExtreme,
            ] as GraphType[]).includes(props.type);
            const ranges = isSensitivitySummary ? undefined : { x: xRange, y: yRange };
            const maxExtents = isSensitivitySummary ? undefined : { x: maxXExtents };

            let data: WodinPlotData;
            if (legendFilteredData) {
                data = legendFilteredData;
            } else {
                data = graphData;
                baseData.value = data;
                legendConfigs.value = getLegendConfigs(baseData.value);
            }

            // skadiChart holds a lot of data, making this reactive will have a performance
            // penalty, if you need to make it reactive, please use shallowRef
            const skadiChart = new Chart<Metadata>({ logScale: { y: config.logScaleYAxis } })
              .addAxes({ x: "Time" })
              .addGridLines()
              .addTraces(data.lines)
              .addScatterPoints(data.points)
              .addZoom({ lockAxis: config.lockYAxis ? "y" : null })
              .makeResponsive()
              .addTooltips(tooltipCallback)
              .addCustomLifecycleHooks({ beforeZoom: updateAxes })
              .appendTo(plot.value!, maxExtents, ranges);

            autoscaledMaxExtentsY.value = skadiChart.autoscaledMaxExtents.y;
        };

        onMounted(drawSkadiChart);

        watch(graph, (newGraph, oldGraph) => {
          if (plotStyle.value !== fadePlotStyle) {
            drawSkadiChart();
            // if a user locks the y axis then we have to store the y axis range that
            // the graph automatically calculates or an existing y axis range
            if (newGraph.config.lockYAxis && !oldGraph.config.lockYAxis) {
              const maxExtentsY = autoscaledMaxExtentsY.value!;
              const yRange = newGraph.config.yAxisRange
                || [maxExtentsY.start, maxExtentsY.end];
              store.dispatch(`graphs/${GraphsAction.UpdateGraph}`, {
                  id: props.id,
                  config: { yAxisRange: yRange }
              } as UpdateGraphPayload);
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
            placeholderMessage,
            DATA_SUMMARY
        };
    }
});
</script>
