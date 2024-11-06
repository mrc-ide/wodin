<template>
    <div v-if="hasData" hidden class="wodin-plot-data-summary">
        <div
            class="wodin-plot-data-summary-series"
            v-for="(series, index) in data"
            :key="index"
            :name="series.name"
            :count="series.x?.length"
            :x-min="Math.min(...series.x!)"
            :x-max="Math.max(...series.x!)"
            :y-min="Math.min(...series.y!)"
            :y-max="Math.max(...series.y!)"
            :mode="series.mode"
            :line-color="series.line?.color"
            :line-dash="series.line?.dash"
            :marker-color="series.marker?.color"
        ></div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { WodinPlotData } from "../plot";

export default defineComponent({
    name: "WodinPlotDataSummary",
    props: {
        data: {
            type: Object as PropType<WodinPlotData>
        }
    },
    setup(props) {
        const hasData = computed(() => !!props.data?.length);
        return {
            hasData
        };
    }
});
</script>
