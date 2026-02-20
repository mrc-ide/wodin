<template>
    <div v-if="hasData" hidden class="wodin-plot-data-summary">
        <div
            class="wodin-plot-data-summary-lines"
            v-for="(summary, index) in linesSummary"
            :key="`line-${index}`"
            v-bind="summary"
        ></div>
        <div
            class="wodin-plot-data-summary-points"
            v-for="(summary, index) in pointsSummary"
            :key="`point-${index}`"
            v-bind="summary"
        ></div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { WodinPlotData } from "@/store/graphs/state";

export default defineComponent({
    name: "WodinPlotDataSummary",
    props: {
        data: {
            type: Object as PropType<WodinPlotData>
        }
    },
    setup(props) {
        const hasData = computed(() => props.data && (props.data.lines.length || props.data.points.length));

        const linesSummary = computed(() => {
            if (!props.data?.lines) return [];
            const lines = props.data.lines;
            return lines.map(l => ({
                name: l.metadata?.tooltipName,
                count: l.points.length,
                xmin: Math.min(...l.points.map(p => p.x)),
                xmax: Math.max(...l.points.map(p => p.x)),
                ymin: Math.min(...l.points.map(p => p.y)),
                ymax: Math.max(...l.points.map(p => p.y)),
                linecolor: l.style.strokeColor,
                linedash: l.style.strokeDasharray,
            }));
        });

        const pointsSummary = computed(() => {
            if (!props.data?.points) return [];
            const points = props.data.points;
            return points.map(p => ({
                name: p.metadata?.name,
                x: p.x,
                y: p.y,
                pointcolor: p.style.color,
            }));
        });

        return {
            hasData,
            linesSummary,
            pointsSummary
        };
    }
});
</script>
