<template>
    <div class="run-model-plot" ref="plot" :style="plotStyle">
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, ref, watch, onMounted, onUnmounted
} from "vue";
import { useStore } from "vuex";
import { EventEmitter } from "events";
import {
    Data, newPlot, react, PlotRelayoutEvent, Plots
} from "plotly.js";
import { modelFit } from "../../store/modelFit/modelFit";
import { FitDataGetter } from "../../store/fitData/getters";

export default defineComponent({
    name: "RunModelPlot",
    props: {
        fadePlot: Boolean,
        modelFit: Boolean
    },
    setup(props) {
        const store = useStore();

        const plotStyle = computed(() => (props.fadePlot ? "opacity:0.5;" : ""));
        const solution = computed(() => (props.modelFit ? store.state.modelFit.solution : store.state.model.odinSolution));

        const startTime = computed(() => {
            return props.modelFit ? store.getters[`fitData/${FitDataGetter.dataStart}`] : 0;
        });
        const endTime = computed(() => {
            return props.modelFit ? store.getters[`fitData/${FitDataGetter.dataEnd}`] : store.state.model.endTime;
        });

        const plot = ref<null | HTMLElement>(null); // Picks up the element with 'plot' ref in the template
        const baseData = ref(null);

        const fitDataSeries = computed(() => {
            return props.modelFit ? store.getters[`fitData/${FitDataGetter.selectedLinkedColumnSeries}`] : [];
        });

        const nPoints = 1000; // TODO: appropriate value could be derived from width of element
        const config = {
            responsive: true
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
                data = solution.value(t0, t1, nPoints);
            }

            const layout = {
                uirevision: "true",
                xaxis: { autorange: true },
                yaxis: { autorange: true }
            };

            const el = plot.value as HTMLElement;
            await react(el, data, layout, config);
        };

        const resize = () => {
            Plots.resize(plot.value as HTMLElement);
        };

        let resizeObserver: null | ResizeObserver = null;

        const drawPlot = () => {
            console.log("drawing plot");
            if (solution.value) {
                console.log("solution exists");
                console.log(`start time is ${startTime.value}`);
                console.log(`end time is ${endTime.value}`);
                let dataToPlot = solution.value(startTime.value, endTime.value, nPoints);

                // model fit partial solution returns single series - convert to array
                if (props.modelFit) {
                    dataToPlot = [dataToPlot] as Data[];
                }

                dataToPlot = [...dataToPlot, ...fitDataSeries.value];
                baseData.value = dataToPlot;
                console.log(`Base data is ${JSON.stringify(baseData.value)}`);

                if (baseData.value) {
                    const el = plot.value as unknown;
                    const layout = {
                        margin: { t: 0 }
                    };
                    console.log("drawing plot");
                    newPlot(el as HTMLElement, baseData.value as Data[], layout, config);
                    (el as EventEmitter).on("plotly_relayout", relayout);
                    resizeObserver = new ResizeObserver(resize);
                    resizeObserver.observe(plot.value as HTMLElement);
                }
            }
        };

        onMounted(drawPlot);

        watch(solution, drawPlot);

        onUnmounted(() => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        });

        return {
            plotStyle,
            plot,
            relayout,
            resize,
            solution
        };
    }
});
</script>
