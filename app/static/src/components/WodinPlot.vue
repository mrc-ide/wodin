<template>
    <div class="wodin-plot-and-legend">
        <div class="wodin-plot-container" :style="plotStyle">
            <div class="plot" ref="plot" id="plot"></div>
            <wodin-plot-data-summary :data="baseData"></wodin-plot-data-summary>
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
import { DataType, GraphConfig } from "../store/graphs/state";
import { Chart, Scales, ZoomProperties } from "@reside-ic/skadi-chart";
import { AppState, VisualisationTab } from "@/store/appState/state";
import { runPlaceholderMessage, tooltipCallback } from "@/utils";
import WodinLegend, { LegendConfig } from "./WodinLegend.vue";
import { GraphsMutation, UpdateConfigPayload } from "@/store/graphs/mutations";
import { STATIC_BUILD } from "@/parseEnv";
import userMessages from "@/userMessages";
import { FitState } from "@/store/fit/state";
import { FitDataGetter } from "@/store/fitData/getters";

export default defineComponent({
    name: "WodinPlot",
    components: { WodinPlotDataSummary, WodinLegend },
    props: {
        fadePlot: Boolean,
        configId: {
            type: String,
            required: true
        },
        graphGroupId: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const store = useStore<AppState>();

        const plotStyle = computed(() => (props.fadePlot ? fadePlotStyle : ""));
        const startTime = 0;

        const plot = ref<null | HTMLDivElement>(null); // Picks up the element with 'plot' ref in the template
        const baseData = computed<WodinPlotData>(() => {
            const emptyData = { lines: [], points: [] };
            const visibleData = store.state.graphs.visibleData[props.graphGroupId];
            if (!visibleData) return emptyData;
            return visibleData.find(({ configId }) => configId === props.configId)?.data || emptyData;
        });

        const config = computed(() => store.state.graphs.configs.find(c => c.id === props.configId)!);

        const dataType = computed(() => store.state.graphs.graphGroups[props.graphGroupId].dataType);

        const hasPlotData = computed(() => !!baseData.value.lines.length || !!baseData.value.points.length);

        const endTime = computed(() => {
          if (store.state.openVisualisationTab !== VisualisationTab.Fit) {
            return store.state.run.endTime;
          } else {
            const state = store.state as FitState;
            const { modelFit } = state;
            const plotRehydratedFit =
              modelFit.result && !modelFit.result.solution && !modelFit.result.error;
            return plotRehydratedFit
              ? state.modelFit.result?.inputs.endTime
              : store.getters[`fitData/${FitDataGetter.dataEnd}`];
          }
        });

        const placeholderMessage = computed(() => {
            if (STATIC_BUILD) return "";
            const tab = store.state.openVisualisationTab;
            if (tab === VisualisationTab.Run) {
                return runPlaceholderMessage(config.value.selectedVariables, false);
            } else if (tab === VisualisationTab.Fit) {
                return userMessages.modelFit.notFittedYet;
            } else if (tab === VisualisationTab.Sensitivity) {
                return runPlaceholderMessage(config.value.selectedVariables, true);
            } else {
                return "";
            }
        });

        const updateAxes = (zoomProperties: ZoomProperties) => {
            if (!zoomProperties) return;

            const newXYRanges = {
              xAxisRange: zoomProperties.x,
              yAxisRange: zoomProperties.eventType === "dblclick" && !config.value.lockYAxis
                ? null
                : zoomProperties.y,
            };

            const payload: UpdateConfigPayload = {
              id: props.configId,
              value: newXYRanges
            };
            store.commit(`graphs/${GraphsMutation.UpdateConfig}`, payload);
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
            const summaryDataTypes = [
              DataType.SensitivityValueAtTime,
              DataType.SensitivityTimeAtExtreme,
              DataType.SensitivityValueAtExtreme
            ];
            const isSummaryType = summaryDataTypes.includes(dataType.value);
            const parameterToVary = store.state.sensitivity.paramSettings.parameterToVary || undefined;

            const cfg = config.value;
            const maxXExtents = isSummaryType ? undefined : { start: startTime, end: endTime.value };
            const xRange = cfg.xAxisRange
              ? { start: cfg.xAxisRange[0], end: cfg.xAxisRange[1] }
              : maxXExtents;
            const yRange = cfg.yAxisRange
              ? { start: cfg.yAxisRange[0], end: cfg.yAxisRange[1] }
              : {};
            const ranges = { x: xRange, y: yRange };

            let data: WodinPlotData;
            if (legendFilteredData) {
                data = legendFilteredData;
            } else {
                data = baseData.value;
                legendConfigs.value = getLegendConfigs(baseData.value);
            }

            // skadiChart holds a lot of data, making this reactive will have a performance
            // penalty, if you need to make it reactive, please use shallowRef
            const skadiChart = new Chart<Metadata>({ logScale: { y: cfg.logScaleYAxis } })
              .addAxes({ x: isSummaryType ? parameterToVary : "Time" })
              .addGridLines()
              .addTraces(data.lines)
              .addScatterPoints(data.points)
              .addZoom({ lockAxis: cfg.lockYAxis ? "y" : null })
              .makeResponsive()
              .addTooltips(tooltipCallback)
              .addCustomLifecycleHooks({ beforeZoom: updateAxes })
              .appendTo(plot.value!, { x: maxXExtents }, ranges);

            autoscaledMaxExtentsY.value = skadiChart.autoscaledMaxExtents.y;
        };

        onMounted(drawSkadiChart);

        watch(config, (newCfg, oldCfg) => {
          if (plotStyle.value === fadePlotStyle) return;

          // if a user locks the y axis then we have to store the y axis range that
          // the graph automatically calculates or an existing y axis range
          if (newCfg.lockYAxis && !oldCfg.lockYAxis) {
            const maxExtentsY = autoscaledMaxExtentsY.value!;
            const yRange = newCfg.yAxisRange
                || [maxExtentsY.start, maxExtentsY.end];

            const payload: UpdateConfigPayload = {
                id: props.configId,
                value: { yAxisRange: yRange }
            };
            store.commit(`graphs/${GraphsMutation.UpdateConfig}`, payload);
          }
        });

        watch(baseData, () => {
          if (plotStyle.value === fadePlotStyle) return;
          drawSkadiChart();
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
            autoscaledMaxExtentsY
        };
    }
});
</script>
