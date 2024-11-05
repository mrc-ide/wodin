<template>
    <div class="hidden-variables-panel m-2" @drop="onDrop($event)" @dragover.prevent @dragenter.prevent>
        <h5>Hidden variables</h5>
        <div class="drop-zone" :class="dragging ? 'drop-zone-active' : 'drop-zone-inactive'">
            <template v-for="variable in hiddenVariables" :key="variable">
                <span
                    class="badge variable me-2 mb-2"
                    :style="getStyle(variable)"
                    draggable="true"
                    @dragstart="startDrag($event, variable)"
                    @dragend="endDrag"
                >
                    {{ variable }}
                </span>
            </template>
            <div v-if="!hiddenVariables.length" class="drop-zone-instruction p-2 me-4">
                Drag variables here to hide them on all graphs.
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { GraphsGetter } from "../../store/graphs/getters";
import SelectVariables from "../mixins/selectVariables";
import { fadeColor } from "./utils";

export default defineComponent({
    name: "HiddenVariables",
    props: {
        dragging: {
            type: Boolean,
            required: true
        }
    },
    setup(props, { emit }) {
        const store = useStore();
        const { startDrag, endDrag, onDrop } = SelectVariables(store, emit, true);
        const hiddenVariables = computed<string[]>(() => store.getters[`graphs/${GraphsGetter.hiddenVariables}`]);
        const palette = computed(() => store.state.model.paletteModel!);

        const getStyle = (variable: string) => {
            const bgcolor = palette.value ? palette.value[variable] : "#eee";
            return { "background-color": fadeColor(bgcolor) };
        };

        return {
            hiddenVariables,
            getStyle,
            startDrag,
            endDrag,
            onDrop
        };
    }
});
</script>

<style scoped lang="scss">
.selected-variables-panel {
    width: 100%;

    .variable {
        font-size: large;
        cursor: pointer;
    }
}
</style>
