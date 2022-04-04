<template>
    <div ref="chart">
        Getting solution
        <div v-if="solution">
            Got solution
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, watch } from "vue";
import { createNamespacedHelpers, useStore } from "vuex";
import {plot} from "plotly.js";
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
        const solution = computed(() => store.state.model.solution);

        const runModel = () => {
            const payload = {
                parameters: {},
                end: 100,
                points: 1000
            };
            store.dispatch(`model/${ModelAction.RunModel}`, payload);
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

        return {
            solution
        };
    }
});


</script>
