<template>
    <div class="run-model-plot" ref="plot">
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, ref, watch
} from "vue";
import { useStore } from "vuex";
import { EventEmitter } from "events";
import {
    Data, newPlot, react, PlotRelayoutEvent, Plots
} from "plotly.js";
import { ModelAction } from "../../store/model/actions";

export default defineComponent({
    name: "RunModelPlot",
    setup() {
        const store = useStore();

        const odin = computed(() => store.state.model.odin);
        const odinUtils = computed(() => store.state.model.odinUtils);
        const solution = computed(() => store.state.model.odinSolution);

        const plot = ref<null | HTMLElement>(null); // Picks up the element with 'plot' ref in the template
        const baseData = ref(null);

        const runModel = () => {
            if (odin.value && odinUtils.value) {
                const payload = {
                    parameters: {},
                    end: 100,
                    points: 1000
                };
                store.dispatch(`model/${ModelAction.RunModel}`, payload);
            }
        };

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
                data = solution.value(t0, t1);
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

        const drawPlot = () => {
            if (baseData.value) {
                const el = plot.value as unknown;
                const layout = {
                    margin: { t: 0 }
                };
                newPlot(el as HTMLElement, baseData.value as Data[], layout, config);
                (el as EventEmitter).on("plotly_relayout", relayout);
                new ResizeObserver(resize).observe(el as HTMLElement);
            }
        };

        watch(odin, () => {
            // TODO: Eventually it probably won't be the component initiating run model, but the store, on updates
            // to code or parameters - whic is not yet implemented
            runModel();
        });

        watch(odinUtils, () => {
            runModel();
        });

        watch(solution, () => {
            baseData.value = solution.value(0, 100); // TODO: default end time will eventually be a prop
            drawPlot();
        });

        return {
            plot,
            relayout,
            resize,
            solution
        };
    }
});
</script>
