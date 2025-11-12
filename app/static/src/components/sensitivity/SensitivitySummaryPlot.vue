<template>
    <div class="summary-plot-container" :style="plotStyle">
        <div class="plot" ref="plot"></div>
        <div v-if="!hasPlotData" class="plot-placeholder">
            {{ placeholderMessage }}
        </div>
        <wodin-plot-data-summary :data="plotData"></wodin-plot-data-summary>
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref, watch } from "vue";
import { useStore } from "vuex";
import { fadePlotStyle, filterUserTypeSeriesSet, odinToSkadiChart, updatePlotTraceName, WodinPlotData } from "../../plot";
import { SensitivityPlotExtremePrefix, SensitivityPlotType, SensitivityScaleType } from "../../store/sensitivity/state";
import { SensitivityMutation } from "../../store/sensitivity/mutations";
import { Batch, OdinUserTypeSeriesSet } from "../../types/responseTypes";
import { runPlaceholderMessage, tooltipCallback } from "../../utils";
import { RunGetter } from "../../store/run/getters";
import { Dict } from "../../types/utilTypes";
import WodinPlotDataSummary from "../WodinPlotDataSummary.vue";
import { ParameterSet } from "../../store/run/state";
import { verifyValidPlotSettingsTime } from "./support";
import { GraphConfig } from "../../store/graphs/state";
import { Chart, LineStyle } from "@reside-ic/skadi-chart";
import { AppState } from "@/store/appState/state";

export default defineComponent({
    name: "SensitivitySummaryPlot",
    components: { WodinPlotDataSummary },
    props: {
        fadePlot: Boolean,
        graphConfig: { type: Object as PropType<GraphConfig>, required: true }
    },
    setup(props) {
        const store = useStore<AppState>();
        const namespace = "sensitivity";
        const plotStyle = computed(() => (props.fadePlot ? fadePlotStyle : ""));
        const plot = ref<null | HTMLDivElement>(null); // Picks up the element with 'plot' ref in the template

        const batch = computed(() => store.state.sensitivity.result?.batch);
        const plotSettings = computed(() => store.state.sensitivity.plotSettings);
        const palette = computed(() => store.state.model.paletteModel);
        const selectedVariables = computed(() => props.graphConfig.selectedVariables);
        const placeholderMessage = computed(() => runPlaceholderMessage(selectedVariables.value, true));

        const visibleParameterSetNames = computed(() => store.getters[`run/${RunGetter.visibleParameterSetNames}`]);
        const parameterSets = computed(() => store.state.run.parameterSets as ParameterSet[]);
        const parameterSetDisplayNames = computed(() => {
            return parameterSets.value.map((paramSet) => paramSet.displayName);
        });

        const paramSetBatches = computed(() => {
            const result = {} as Dict<Batch>;
            Object.keys(store.state.sensitivity.parameterSetResults).forEach((paramSetName: string) => {
                const psBatch = store.state.sensitivity.parameterSetResults[paramSetName]?.batch;
                if (psBatch && visibleParameterSetNames.value.includes(paramSetName)) {
                    result[paramSetName] = psBatch;
                }
            });
            return result;
        });
        const lineStylesForParamSets = computed(() => store.getters[`run/${RunGetter.lineStylesForParameterSets}`]);

        const finishLoading = () => {
            if (store.state.sensitivity.loading) {
                store.commit(`${namespace}/${SensitivityMutation.SetLoading}`, false);
            }
        };

        const plotData = computed<WodinPlotData>(() => {
            if (!batch.value) {
                finishLoading();
                return { lines: [], points: [] };
            }

            const paramName = store.state.sensitivity.paramSettings.parameterToVary;
            let data: null | OdinUserTypeSeriesSet;
            const paramSetData: Dict<OdinUserTypeSeriesSet> = {};
            if (plotSettings.value.plotType === SensitivityPlotType.ValueAtTime) {
                verifyValidPlotSettingsTime(store.state, store.commit);
                data = batch.value.valueAtTime(plotSettings.value.time!);
                Object.keys(paramSetBatches.value).forEach((name) => {
                    paramSetData[name] = paramSetBatches.value[name].valueAtTime(plotSettings.value.time!);
                });
            } else {
                const paramPrefix =
                    plotSettings.value.plotType === SensitivityPlotType.TimeAtExtreme
                        ? SensitivityPlotExtremePrefix.time
                        : SensitivityPlotExtremePrefix.value;
                const extremeParam = `${paramPrefix}${plotSettings.value.extreme}`;
                data = batch.value.extreme(extremeParam);
                Object.keys(paramSetBatches.value).forEach((paramSetName) => {
                    paramSetData[paramSetName] = paramSetBatches.value[paramSetName].extreme(extremeParam);
                });
            }

            const filtered = filterUserTypeSeriesSet(data!, paramName!, selectedVariables.value);
            const result: WodinPlotData = {
                lines: [...odinToSkadiChart(filtered, palette.value!)],
                points: []
            };
            Object.keys(paramSetData).forEach((name: string) => {
                const strokeDasharray = lineStylesForParamSets.value[name];
                const options: LineStyle = {
                    strokeWidth: 1,
                    strokeDasharray
                };
                const psData = paramSetData[name];
                const psFiltered = filterUserTypeSeriesSet(psData, paramName!, selectedVariables.value);
                const psPlotData = odinToSkadiChart(psFiltered, palette.value!, options);
                const currentParamSet = parameterSets.value.find((paramSet) => paramSet.name === name);
                psPlotData.forEach((plotTrace) => {
                    updatePlotTraceName(plotTrace, null, null, currentParamSet!.displayName);
                });
                result.lines.push(...psPlotData);
            });
            finishLoading();
            return result;
        });

        const hasPlotData = computed(() => {
            return plotData.value.lines.length || plotData.value.points.length;
        });

        const drawPlot = () => {
            if (!hasPlotData.value) return;

            const { scaleType } = store.state.sensitivity.paramSettings;
            const logScaleX = scaleType === SensitivityScaleType.Logarithmic;

            const isNotTimePlot = plotSettings.value.plotType !== SensitivityPlotType.TimeAtExtreme;
            const logScaleY = props.graphConfig.settings.logScaleYAxis && isNotTimePlot;

            new Chart({ logScale: { x: logScaleX, y: logScaleY } })
                .addAxes({ x: store.state.sensitivity.paramSettings.parameterToVary! })
                .addGridLines()
                .addTraces(plotData.value.lines)
                .makeResponsive()
                .addZoom()
                .addTooltips(tooltipCallback)
                .appendTo(plot.value!);
        };

        onMounted(drawPlot);

        watch([plotData, () => props.graphConfig, parameterSetDisplayNames], drawPlot);

        return {
            placeholderMessage,
            plot,
            plotStyle,
            plotData,
            hasPlotData
        };
    }
});
</script>
