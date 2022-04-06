<template>
    <div ref="chart">
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { createNamespacedHelpers, useStore } from "vuex";
import {Data, newPlot} from "plotly.js";
import {ModelAction} from "../../store/model/actions";

const { mapState, mapActions } = createNamespacedHelpers('model');

export default defineComponent({
    name: "Chart",
    props: {
        chartMetadata: Object,
        chartData: Object,
        layoutData: Object

    },
    setup() {
        const store = useStore();

        const odin = computed(() => store.state.model.odin);
        const odinUtils = computed(() => store.state.model.odinUtils);
        const solution = computed(() => store.state.model.odinSolution);

        const chart = ref(null); // Picks up the element with 'chart' ref in the template
        const baseData = ref(null);

        const runModel = () => {
            const payload = {
                parameters: {},
                end: 100,
                points: 1000
            };
            store.dispatch(`model/${ModelAction.RunModel}`, payload);
        };

        const layout = {
            uirevision: 'true',
            xaxis: {autorange: true},
            yaxis: {autorange: true}
        };

        const drawChart = () => {
            if (baseData.value) {
                const el = chart.value as unknown;
                newPlot(el as HTMLElement, baseData.value as Data[], layout)
            }
        };

        watch(odin, (newValue) => {
            if (newValue && odinUtils) {
                runModel();
            }
        });

        watch(odinUtils, (newValue) => {
            if (newValue && odin) {
                runModel();
            }
        });

        watch(solution, () => {
            baseData.value = solution.value(0, 100);
            drawChart();
        });

        return {
            chart,
            solution,
            baseData
        };
    }
});
</script>
