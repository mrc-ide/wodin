<template>
    <div ref="plot">
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch} from "vue";
import { createNamespacedHelpers, useStore } from "vuex";
import {EventEmitter} from "events";
import {Data, newPlot, react} from "plotly.js";
import {ModelAction} from "../../store/model/actions";

const { mapState, mapActions } = createNamespacedHelpers('model');

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
            if (odin && odinUtils) {
                const payload = {
                    parameters: {},
                    end: 100,
                    points: 1000
                };
                store.dispatch(`model/${ModelAction.RunModel}`, payload);
            }
        };

        const drawPlot = () => {
            if (baseData.value) {
                const el = plot.value as unknown;
                const layout = {
                    margin: { t: 0 }
                };
                newPlot(el as HTMLElement, baseData.value as Data[], layout);
                (el as EventEmitter).on('plotly_relayout', relayout);
            }
        };

        const relayout = async (event: any) => {
            let data;
            if (event['xaxis.autorange'] === true) {
                data = baseData.value;
            } else {
                let t0 = event['xaxis.range[0]'];
                let t1 = event['xaxis.range[1]'];
                if (t0 === undefined || t1 === undefined) {
                    return;
                }
                data = solution.value(t0, t1);
            }

            const layout = {
                uirevision: 'true',
                xaxis: {autorange: true},
                yaxis: {autorange: true}
            };

            const el = plot.value as HTMLElement;
            await react(el, data, layout);
        };

        watch(odin, () => {
            runModel();
        });

        watch(odinUtils, () => {
            runModel();
        });

        watch(solution, () => {
            baseData.value = solution.value(0, 100); //TODO: default end time will eventually be a prop
            drawPlot();
        });

        return {
            plot
        };
    }
});
</script>
