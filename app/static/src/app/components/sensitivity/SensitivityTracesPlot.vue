<template>
  <wodin-ode-plot
      :fade-plot="fadePlot"
      :placeholder-message="placeholderMessage"
      :end-time="endTime"
      :plot-data="allPlotData"
      :solutions="solutions">
    <slot></slot>
  </wodin-ode-plot>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { PlotData } from "plotly.js";
import { format } from "d3-format";
import WodinOdePlot from "../WodinOdePlot.vue";
import userMessages from "../../userMessages";
import { odinToPlotly, WodinPlotData } from "../../plot";
import { OdinSolution } from "../../types/responseTypes";

export default defineComponent({
    name: "SensitivityTracesPlot",
    props: {
        fadePlot: Boolean
    },
    components: {
        WodinOdePlot
    },
    setup() {
        const store = useStore();

        const placeholderMessage = userMessages.sensitivity.notRunYet;

        const solutions = computed(() => (store.state.sensitivity.batch?.solutions || []));
        const centralSolution = computed(() => (store.state.run.result?.result));

        const endTime = computed(() => store.state.run.endTime);

        const palette = computed(() => store.state.model.paletteModel);

        const updatePlotTraceNameWithParameterValue = (plotTrace: Partial<PlotData>, param: string, value: number) => {
            // eslint-disable-next-line no-param-reassign
            plotTrace.name = `${plotTrace.name} (${param}=${format(".3f")(value)})`;
        };

        const allPlotData = (start: number, end: number, points: number): WodinPlotData => {
            const { batch } = store.state.sensitivity;

            const result: Partial<PlotData>[] = [];
            if (solutions.value.length) {
                solutions.value.forEach((sln: OdinSolution, slnIdx: number) => {
                    const data = sln(start, end, points);
                    const plotlyOptions = {
                        includeLegendGroup: true,
                        lineWidth: 1,
                        showLegend: false
                    };
                    if (data) {
                        const plotData = odinToPlotly(data, palette.value, plotlyOptions);
                        plotData.forEach((plotTrace) => {
                            updatePlotTraceNameWithParameterValue(plotTrace, batch.pars.name,
                                batch.pars.values[slnIdx]);
                        });

                        result.push(...plotData);
                    }
                });

                if (centralSolution.value) {
                    const centralData = centralSolution.value(start, end, points);
                    if (centralData) {
                        const plotlyOptions = { includeLegendGroup: true };
                        result.push(...odinToPlotly(centralData, palette.value, plotlyOptions));
                    }
                }
            }

            return result;
        };

        return {
            placeholderMessage,
            endTime,
            solutions,
            allPlotData
        };
    }
});
</script>
