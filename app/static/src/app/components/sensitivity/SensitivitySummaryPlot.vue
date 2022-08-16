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
import { newPlot, Plots } from "plotly.js";
import { useStore } from "vuex";
import {
    fadePlotStyle, margin, config, odinToPlotly
} from "../../plot";
import { SensitivityPlotType } from "../../store/sensitivity/state";
import userMessages from "../../userMessages";

export default defineComponent({
    name: "SensitivitySummaryPlot",
    props: {
        fadePlot: Boolean
    },
    setup(props) {
        const store = useStore();
        const plotStyle = computed(() => (props.fadePlot ? fadePlotStyle : ""));
        const plot = ref<null | HTMLElement>(null); // Picks up the element with 'plot' ref in the template
        const placeholderMessage = userMessages.sensitivity.notRunYet;

        const batch = computed(() => store.state.sensitivity.batch);
        const plotSettings = computed(() => store.state.sensitivity.plotSettings);
        const palette = computed(() => store.state.model.paletteModel);
        const plotData = computed(() => {
            if (batch.value) {
            // TODO: implement other summary plot types
                if (plotSettings.value.plotType === SensitivityPlotType.ValueAtTime) {
                    // TODO: make sure time is valid for model
                    const data = batch.value.valueAtTime(plotSettings.value.time);
                    return [...odinToPlotly(data, palette.value)];
                }
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
                    margin
                };
                newPlot(el as HTMLElement, plotData.value, layout, config);
                resizeObserver = new ResizeObserver(resize);
                resizeObserver.observe(plot.value as HTMLElement);
            }
        };

        onMounted(drawPlot);

        watch(plotData, drawPlot);

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
            hasPlotData
        };
    }
});

</script>
