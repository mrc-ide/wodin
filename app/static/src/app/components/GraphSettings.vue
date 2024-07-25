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
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { GraphsMutation } from "../store/graphs/mutations";

export default defineComponent({
    name: "GraphSettings",
    props: {
        graphIndex: {
            type: Number,
            required: false,
            default: -1
        },
        fitPlot: {
            type: Boolean,
            required: true
        }
    },
    setup(props) {
        const store = useStore();
        const settings = computed(() =>
            props.fitPlot ? store.state.graphs.fitGraphSettings : store.state.graphs.config[props.graphIndex].settings
        );
        const logScaleYAxis = computed({
            get() {
                return settings.value.logScaleYAxis;
            },
            set(newValue) {
                if (props.fitPlot) {
                    store.commit(`graphs/${GraphsMutation.SetFitLogScaleYAxis}`, newValue);
                } else {
                    store.commit(`graphs/${GraphsMutation.SetLogScaleYAxis}`, {
                        graphIndex: props.graphIndex,
                        value: newValue
                    });
                }
            }
        });

        const lockYAxis = computed({
            get() {
                return settings.value.lockYAxis;
            },
            set(newValue) {
                if (props.fitPlot) {
                    store.commit(`graphs/${GraphsMutation.SetFitLockYAxis}`, newValue);
                } else {
                    store.commit(`graphs/${GraphsMutation.SetLockYAxis}`, {
                        graphIndex: props.graphIndex,
                        value: newValue
                    });
                }
            }
        });

        return {
            logScaleYAxis,
            lockYAxis
        };
    }
});
</script>
