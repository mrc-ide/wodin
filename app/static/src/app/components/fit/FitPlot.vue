<template>
    <wodin-ode-plot
        :fade-plot="fadePlot"
        :placeholder-message="placeholderMessage"
        :end-time="endTime"
        :plot-data="allPlotData"
        :solutions="solution ? [solution] : []">
        <slot></slot>
    </wodin-ode-plot>
</template>

<script lang="ts">
import {
    computed, defineComponent
} from "vue";
import { useStore } from "vuex";
import { FitDataGetter } from "../../store/fitData/getters";
import userMessages from "../../userMessages";
import {
    filterSeriesSet, fitDataToPlotly, odinToPlotly, WodinPlotData
} from "../../plot";
import WodinOdePlot from "../WodinOdePlot.vue";

export default defineComponent({
    name: "FitPlot",
    components: { WodinOdePlot },
    props: {
        fadePlot: Boolean
    },
    setup() {
        const store = useStore();

        const placeholderMessage = userMessages.modelFit.notFittedYet;

        const solution = computed(() => store.state.modelFit.result?.solution);

        const endTime = computed(() => store.getters[`fitData/${FitDataGetter.dataEnd}`]);

        const link = computed(() => store.getters[`fitData/${FitDataGetter.link}`]);

        const allPlotData = (start: number, end: number, points: number): WodinPlotData => {
            const { data } = store.state.fitData;
            const result = solution.value && solution.value(start, end, points);
            if (!data || !link.value || !result) {
                return [];
            }
            const palette = store.state.model.paletteModel;
            return [
                ...odinToPlotly(filterSeriesSet(result, link.value.model), palette),
                ...fitDataToPlotly(data, link.value, palette, start, end)
            ];
        };

        return {
            placeholderMessage,
            solution,
            endTime,
            allPlotData
        };
    }
});
</script>
