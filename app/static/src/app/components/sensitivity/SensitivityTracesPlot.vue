<template>
  <div class="run-plot-container" :style="plotStyle">
    <div class="run-plot" ref="plot">
    </div>
    <div v-if="!hasPlotData" class="plot-placeholder">
      {{ placeholderMessage }}
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, ref, watch, onMounted, onUnmounted
} from "vue";
import { useStore } from "vuex";
import { EventEmitter } from "events";
import {
    newPlot, react, PlotRelayoutEvent, Plots, PlotData
} from "plotly.js";
import { format } from "d3-format";
import userMessages from "../../userMessages";
import { odinToPlotly, WodinPlotData } from "../../plot";
import { OdinSolution } from "../../types/responseTypes";

export default defineComponent({
    name: "SensitivityTracesPlot",
    props: {
        fadePlot: Boolean
    },
    setup(props) {
        const store = useStore();

        // TODO: placeholder message
        const placeholderMessage = computed(() => "sensitivity not run");

        const plotStyle = computed(() => (props.fadePlot ? "opacity:0.5;" : ""));
        const solutions = computed(() => (store.state.sensitivity.batch?.solutions || []));
        const centralSolution = computed(() => (store.state.model.odinSolution));

        // mrc-3331 start time should always be zero.
        const startTime = 0;
        const endTime = computed(() => store.state.model.endTime);

        const palette = computed(() => store.state.model.paletteModel);

        const plot = ref<null | HTMLElement>(null); // Picks up the element with 'plot' ref in the template
        const baseData = ref<WodinPlotData>([]);
        const nPoints = 1000; // TODO: appropriate value could be derived from width of element

        const hasPlotData = computed(() => !!(baseData.value?.length));

        const updatePlotTraceNameWithParameterValue = (plotTrace: Partial<PlotData>, param: string, value: number) => {
            plotTrace.name = `${plotTrace.name} (${param}=${format(".3f")(value)})`;
        };

        const allPlotData = (start: number, end: number): WodinPlotData => {
            const { batch } = store.state.sensitivity;

            const result: Partial<PlotData>[] = [];
            solutions.value.forEach((sln: OdinSolution, slnIdx: number) => {
                const data = sln(start, end, nPoints);
                const plotlyOptions = {
                    includeLegendGroup: true,
                    lineWidth: 1,
                    showLegend: false
                };
                if (data) {
                    const plotData = odinToPlotly(data, palette.value, plotlyOptions);
                    plotData.forEach((plotTrace) => {
                        updatePlotTraceNameWithParameterValue(plotTrace, batch.pars.name, batch.pars.values[slnIdx]);
                    });

                    result.push(...plotData);
                }
            });

            const centralData = centralSolution.value(start, end, nPoints);
            if (centralData) {
                const plotlyOptions = { includeLegendGroup: true };
                result.push(...odinToPlotly(centralData, palette.value, plotlyOptions));
            }

            return result;
        };

        const config = {
            responsive: true
        };

        // This is enough top margin to accomodate the plotly options
        // bar without it interfering with the first series in the
        // legend.
        const margin = {
            t: 25
        };

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
                data = allPlotData(t0, t1);
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
            if (solutions.value.length) {
                baseData.value = allPlotData(startTime, endTime.value);

                if (hasPlotData.value) {
                    const el = plot.value as unknown;
                    const layout = {
                        margin
                    };
                    newPlot(el as HTMLElement, baseData.value, layout, config);
                    (el as EventEmitter).on("plotly_relayout", relayout);
                    resizeObserver = new ResizeObserver(resize);
                    resizeObserver.observe(plot.value as HTMLElement);
                }
            }
        };

        onMounted(drawPlot);

        watch(solutions, drawPlot);

        onUnmounted(() => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        });

        return {
            placeholderMessage,
            plotStyle,
            plot,
            relayout,
            resize,
            solutions,
            baseData,
            hasPlotData
        };
    }
});
</script>
<style scoped lang="scss">
.plot-placeholder {
  width: 100%;
  height: 450px;
  background-color: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>
