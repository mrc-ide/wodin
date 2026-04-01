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
import { GraphConfig } from "@/store/graphs/state";
import { GraphsMutation, UpdateConfigPayload } from "@/store/graphs/mutations";

export default defineComponent({
    name: "GraphSettings",
    props: {
        config: {
            type: Object as PropType<GraphConfig>,
            required: true,
        },
    },
    setup(props) {
        const store = useStore();
        const logScaleYAxis = computed({
            get() { return props.config.logScaleYAxis },
            set(newValue) {
                const payload: UpdateConfigPayload = {
                    id: props.config.id,
                    value: {
                        logScaleYAxis: newValue,
                        yAxisRange: null,
                    },
                };
                store.commit(`graphs/${GraphsMutation.UpdateConfig}`, payload);
            }
        });

        const lockYAxis = computed({
            get() { return props.config.lockYAxis },
            set(newValue) {
                const payload: UpdateConfigPayload = {
                    id: props.config.id,
                    value: { lockYAxis: newValue },
                };
                store.commit(`graphs/${GraphsMutation.UpdateConfig}`, payload);
            }
        });

        return {
            logScaleYAxis,
            lockYAxis
        };
    }
});
</script>
