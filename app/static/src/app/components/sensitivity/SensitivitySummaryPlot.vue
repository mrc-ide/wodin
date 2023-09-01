<template>
  <div class="summary-plot-container" :style="plotStyle">
    <div class="plot" ref="plot">
    </div>
    <div v-if="!hasPlotData" class="plot-placeholder">
      {{ placeholderMessage }}
    </div>
    <wodin-plot-data-summary :data="plotData"></wodin-plot-data-summary>
    <slot></slot>
  </div>
</template>

<script lang="ts">

import {
    computed, defineComponent, onMounted, onUnmounted, ref, watch
} from "vue";
import { AxisType, newPlot, Plots } from "plotly.js-basic-dist-min";
import { useStore } from "vuex";
import {
    config, fadePlotStyle, filterUserTypeSeriesSet, margin, odinToPlotly, updatePlotTraceName
} from "../../plot";
import { SensitivityPlotExtremePrefix, SensitivityPlotType, SensitivityScaleType } from "../../store/sensitivity/state";
import {BaseSensitivityMutation, SensitivityMutation} from "../../store/sensitivity/mutations";
import { Batch, OdinUserTypeSeriesSet } from "../../types/responseTypes";
import { runPlaceholderMessage } from "../../utils";
import { RunGetter } from "../../store/run/getters";
import { Dict } from "../../types/utilTypes";
import WodinPlotDataSummary from "../WodinPlotDataSummary.vue";
import { ParameterSet } from "../../store/run/state";
import { verifyValidPlotSettingsTime } from "./support";

export default defineComponent({
    name: "SensitivitySummaryPlot",
    components: { WodinPlotDataSummary },
    props: {
        fadePlot: Boolean
    },
    setup(props) {
        const store = useStore();
        const namespace = "sensitivity";
        const plotStyle = computed(() => (props.fadePlot ? fadePlotStyle : ""));
        const plot = ref<null | HTMLElement>(null); // Picks up the element with 'plot' ref in the template

        const batch = computed(() => store.state.sensitivity.result?.batch);
        const plotSettings = computed(() => store.state.sensitivity.plotSettings);
        const palette = computed(() => store.state.model.paletteModel);
        const selectedVariables = computed(() => store.state.model.selectedVariables);
        const placeholderMessage = computed(() => runPlaceholderMessage(selectedVariables.value, true));

        const xAxisSettings = computed(() => {
            const { paramSettings } = store.state.sensitivity;
            // https://plotly.com/javascript/reference/layout/xaxis/#layout-xaxis-type
            const xtype: AxisType = paramSettings.scaleType === SensitivityScaleType.Logarithmic ? "log" : "linear";
            return {
                title: paramSettings.parameterToVary,
                type: xtype
            };
        });

        const yAxisSettings = computed(() => {
            const isNotTimePlot = plotSettings.value.plotType !== SensitivityPlotType.TimeAtExtreme;
            const logScale = store.state.graphSettings.logScaleYAxis && isNotTimePlot;
            const type = logScale ? "log" : "linear" as AxisType;
            return { type };
        });

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

        const plotData = computed(() => {
            if (batch.value) {
                const paramName = store.state.sensitivity.paramSettings.parameterToVary;
                let data: null | OdinUserTypeSeriesSet;
                const paramSetData: Dict<OdinUserTypeSeriesSet> = {};
                if (plotSettings.value.plotType === SensitivityPlotType.ValueAtTime) {
                    verifyValidPlotSettingsTime(store.state, store.commit);
                    data = batch.value.valueAtTime(plotSettings.value.time);
                    Object.keys(paramSetBatches.value).forEach((name) => {
                        paramSetData[name] = paramSetBatches.value[name].valueAtTime(plotSettings.value.time);
                    });
                } else {
                    const paramPrefix = plotSettings.value.plotType === SensitivityPlotType.TimeAtExtreme
                        ? SensitivityPlotExtremePrefix.time
                        : SensitivityPlotExtremePrefix.value;
                    const extremeParam = `${paramPrefix}${plotSettings.value.extreme}`;
                    data = batch.value.extreme(extremeParam);
                    Object.keys(paramSetBatches.value).forEach((paramSetName) => {
                        paramSetData[paramSetName] = paramSetBatches.value[paramSetName].extreme(extremeParam);
                    });
                }

                const filtered = filterUserTypeSeriesSet(data!, paramName, selectedVariables.value);
                const result = [...odinToPlotly(filtered, palette.value, { includeLegendGroup: true })];
                Object.keys(paramSetData).forEach((name: string) => {
                    const dash = lineStylesForParamSets.value[name];
                    const options = {
                        includeLegendGroup: true,
                        lineWidth: 1,
                        showLegend: false,
                        dash
                    };
                    const psData = paramSetData[name];
                    const psFiltered = filterUserTypeSeriesSet(psData, paramName, selectedVariables.value);
                    const psPlotData = odinToPlotly(psFiltered, palette.value, options);
                    const currentParamSet = parameterSets.value.find((paramSet) => paramSet.name === name);
                    psPlotData.forEach((plotTrace) => {
                        updatePlotTraceName(plotTrace, null, null, currentParamSet!.displayName);
                    });
                    result.push(...psPlotData);
                });
                finishLoading();
                return result;
            }
            finishLoading();
            return [];
        });
        const hasPlotData = computed(() => !!(plotData.value?.length));

        const resize = () => {
            if (plot.value) {
                Plots.resize(plot.value as HTMLElement);
            }
        };

        let resizeObserver: null | ResizeObserver = null;

        const drawPlot = () => {
            if (hasPlotData.value) {
                const el = plot.value as unknown;
                const layout = {
                    margin,
                    yaxis: yAxisSettings.value,
                    xaxis: xAxisSettings.value
                };
                newPlot(el as HTMLElement, plotData.value, layout, config);
                resizeObserver = new ResizeObserver(resize);
                resizeObserver.observe(plot.value as HTMLElement);
            }
        };

        onMounted(drawPlot);

        watch([plotData, yAxisSettings, parameterSetDisplayNames], drawPlot);

        onUnmounted(() => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        });

        return {
            placeholderMessage,
            plot,
            plotStyle,
            plotData,
            hasPlotData,
            resize
        };
    }
});

</script>
