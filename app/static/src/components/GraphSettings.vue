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
import { GraphsMutation, SetGraphSettingsPayload } from "../store/graphs/mutations";
import { GraphConfig } from "@/store/graphs/state";

export default defineComponent({
    name: "GraphSettings",
    props: {
        graphConfig: {
            type: Object as PropType<GraphConfig>,
            required: true,
        },
    },
    setup(props) {
        const store = useStore();
        const logScaleYAxis = computed({
            get() {
                return props.graphConfig.settings.logScaleYAxis;
            },
            set(newValue) {
                store.commit(`graphs/${GraphsMutation.SetGraphSettings}`, {
                    id: props.graphConfig.id,
                    settings: {
                      logScaleYAxis: newValue,
                      yAxisRange: null
                    }
                } as SetGraphSettingsPayload);
            }
        });

        const lockYAxis = computed({
            get() {
                return props.graphConfig.settings.lockYAxis;
            },
            set(newValue) {
                store.commit(`graphs/${GraphsMutation.SetGraphSettings}`, {
                    id: props.graphConfig.id,
                    settings: { lockYAxis: newValue }
                } as SetGraphSettingsPayload);
            }
        });

        return {
            logScaleYAxis,
            lockYAxis
        };
    }
});
</script>
