<template>
  <div class="summary-plot-container" :style="plotStyle">
    <div class="plot" ref="plot">
    </div>
    <div v-if="!hasPlotData" class="plot-placeholder">
      {{ placeholderMessage }}
    </div>
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
  fadePlotStyle, margin, config, odinToPlotly, filterSeriesSet, updatePlotTraceName
} from "../../plot";
import { SensitivityPlotType, SensitivityScaleType } from "../../store/sensitivity/state";
import { SensitivityMutation } from "../../store/sensitivity/mutations";
import { Batch, OdinSeriesSet } from "../../types/responseTypes";
import { runPlaceholderMessage } from "../../utils";
import { RunGetter } from "../../store/run/getters";
import { Dict } from "../../types/utilTypes";

export default defineComponent({
    name: "SensitivitySummaryPlot",
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

        const verifyValidEndTime = () => {
            // update plot settings' end time to be valid before we use it
            let endTime = plotSettings.value.time;
            const modelEndTime = store.state.run.endTime;
            if (endTime === null) {
                endTime = modelEndTime;
            } else {
                endTime = Math.max(0, Math.min(modelEndTime, endTime));
            }
            if (endTime !== plotSettings.value.time) {
                store.commit(`${namespace}/${SensitivityMutation.SetPlotTime}`, endTime);
            }
        };

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

        const paramSetBatches = computed(() => {
            const result = {} as Dict<Batch>;
            Object.keys(store.state.sensitivity.parameterSetResults).forEach((paramSetName: string) => {
                const psBatch = store.state.sensitivity.parameterSetResults[paramSetName]?.batch;
                if (psBatch) {
                    result[paramSetName] = psBatch;
                }
            });
            return result;
        });
        const lineStylesForParamSets = computed(() => store.getters[`run/${RunGetter.lineStylesForParameterSets}`]);

        const plotData = computed(() => {
            if (batch.value) {
                let data: null | OdinSeriesSet;
                const paramSetData: Dict<OdinSeriesSet> = {};
                if (plotSettings.value.plotType === SensitivityPlotType.ValueAtTime) {
                    verifyValidEndTime();
                    data = batch.value.valueAtTime(plotSettings.value.time);
                    Object.keys(paramSetBatches.value).forEach((paramSetName) => {
                        paramSetData[paramSetName] = paramSetBatches.value[paramSetName].valueAtTime(plotSettings.value.time);
                    });
                } else {
                    const paramPrefix = plotSettings.value.plotType === SensitivityPlotType.TimeAtExtreme ? "t" : "y";
                    const extremeParam = `${paramPrefix}${plotSettings.value.extreme}`;
                    data = batch.value.extreme(extremeParam);
                    Object.keys(paramSetBatches.value).forEach((paramSetName) => {
                        paramSetData[paramSetName] = paramSetBatches.value[paramSetName].extreme(extremeParam);
                    });
                }

                const result = [...odinToPlotly(filterSeriesSet(data!, selectedVariables.value), palette.value)];
                Object.keys(paramSetData).forEach((paramSetName: string) => {
                    const dash = lineStylesForParamSets.value[paramSetName];
                    const options = {
                        includeLegendGroup: true,
                        lineWidth: 1,
                        showLegend: false,
                        dash
                    };
                    const psData = paramSetData[paramSetName];
                    const psPlotData = odinToPlotly(filterSeriesSet(psData, selectedVariables.value), palette.value, options);
                    psPlotData.forEach((plotTrace) => {
                        updatePlotTraceName(plotTrace, null, null, paramSetName);
                    });
                    result.push(...psPlotData);
                });
                return result;
            }
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

        watch([plotData, yAxisSettings], drawPlot);

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
