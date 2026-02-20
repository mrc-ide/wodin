<template>
    <div>
        <div class="log-scale-y-axis form-check form-check-inline">
            <label class="form-check-label">Log scale y axis</label>
            <input type="checkbox" class="form-check-input" style="vertical-align: bottom" v-model="logScaleYAxis" />
        </div>
        <div class="lock-y-axis form-check form-check-inline">
            <label class="form-check-label">Lock y axis</label>
            <input type="checkbox" class="form-check-input" style="vertical-align: bottom" v-model="lockYAxis" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import { useStore } from "vuex";
import { Graph } from "@/store/graphs/state";
import { GraphsAction, UpdateGraphPayload } from "@/store/graphs/actions";

export default defineComponent({
    name: "GraphSettings",
    props: {
        graph: {
            type: Object as PropType<Graph>,
            required: true,
        },
    },
    setup(props) {
        const store = useStore();
        const logScaleYAxis = computed({
            get() {
                return props.graph.config.logScaleYAxis;
            },
            set(newValue) {
                store.dispatch(`graphs/${GraphsAction.UpdateGraph}`, {
                    id: props.graph.id,
                    config: {
                        logScaleYAxis: newValue,
                        yAxisRange: null
                    }
                } as UpdateGraphPayload);
            }
        });

        const lockYAxis = computed({
            get() {
                return props.graph.config.lockYAxis;
            },
            set(newValue) {
                store.dispatch(`graphs/${GraphsAction.UpdateGraph}`, {
                    id: props.graph.id,
                    config: { lockYAxis: newValue }
                } as UpdateGraphPayload);
            }
        });

        return {
            logScaleYAxis,
            lockYAxis
        };
    }
});
</script>
