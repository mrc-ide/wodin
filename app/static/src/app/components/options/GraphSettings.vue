<template>
    <div class="container">
        <div id="log-scale-y-axis" class="row my-2">
            <div class="col-5">
                <label class="col-form-label">Log scale y axis</label>
            </div>
            <div class="col-6">
                <input
                    type="checkbox"
                    class="form-check-input"
                    style="vertical-align: bottom"
                    v-model="logScaleYAxis"
                />
            </div>
        </div>
        <div id="lock-y-axis" class="row my-2">
            <div class="col-5">
                <label class="col-form-label">Lock y axis</label>
            </div>
            <div class="col-6">
                <input type="checkbox" class="form-check-input" style="vertical-align: bottom" v-model="lockYAxis" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { GraphsMutation } from "../../store/graphs/mutations";

export default defineComponent({
    name: "GraphSettings",
    setup() {
        const store = useStore();
        const logScaleYAxis = computed({
            get() {
                return store.state.graphs.settings.logScaleYAxis;
            },
            set(newValue) {
                store.commit(`graphs/${GraphsMutation.SetLogScaleYAxis}`, newValue);
            }
        });

        const lockYAxis = computed({
            get() {
                return store.state.graphs.settings.lockYAxis;
            },
            set(newValue) {
                store.commit(`graphs/${GraphsMutation.SetLockYAxis}`, newValue);
            }
        });

        return {
            logScaleYAxis,
            lockYAxis
        };
    }
});
</script>
