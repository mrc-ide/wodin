<template>
    <div class="graph-config-panel m-2" @drop="onDrop($event)" @dragover.prevent @dragenter.prevent>
        <button
            type="button"
            class="btn btn-sm btn-light bg-transparent border-0 float-end delete-graph"
            v-if="canDelete"
            @click="deleteGraph"
            v-tooltip="'Delete Graph'"
        >
            <vue-feather class="inline-icon clickable ms-2" type="trash-2"></vue-feather>
        </button>
        <graph-settings :fit-plot="false" :graph-index="graphIndex" class="graph-config-settings mb-1"></graph-settings>
        <div class="drop-zone" :class="dragging ? 'drop-zone-active' : 'drop-zone-inactive'">
            <template v-for="variable in selectedVariables" :key="variable">
                <span
                    class="badge variable me-2"
                    :style="getStyle(variable)"
                    :draggable="true"
                    @dragstart="startDrag($event, variable)"
                    @dragend="endDrag"
                >
                    <span class="variable-name">{{ variable }}</span>
                    <span class="variable-delete">
                        <button @click="removeVariable(graphIndex, variable)" v-tooltip="'Remove variable'">×</button>
                    </span>
                </span>
            </template>
            <div v-if="!selectedVariables.length" class="drop-zone-instruction p-2 me-4">
                Drag variables here to select them for this graph. Press the Ctrl or ⌘ key on drag to make a copy of a
                variable.
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import VueFeather from "vue-feather";
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import GraphSettings from "@/app/components/GraphSettings.vue";
import SelectVariables from "../mixins/selectVariables";
import { GraphsMutation } from "../../store/graphs/mutations";

export default defineComponent({
    name: "GraphConfig",
    components: {
        GraphSettings,
        VueFeather
    },
    props: {
        dragging: {
            type: Boolean,
            required: true
        },
        graphIndex: {
            type: Number,
            required: true
        }
    },
    setup(props, { emit }) {
        const store = useStore();
        const { startDrag, endDrag, onDrop, removeVariable } = SelectVariables(store, emit, false, props.graphIndex);
        const selectedVariables = computed<string[]>(
            () => store.state.graphs.config[props.graphIndex].selectedVariables
        );
        const canDelete = computed(() => store.state.graphs.config.length > 1);
        const palette = computed(() => store.state.model.paletteModel!);

        const getStyle = (variable: string) => {
            let bgcolor = "#bbb"; // grey out unselected variables
            if (selectedVariables.value.includes(variable)) {
                bgcolor = palette.value[variable]!;
            }
            return { "background-color": bgcolor };
        };

        const deleteGraph = () => {
            store.commit(`graphs/${GraphsMutation.DeleteGraph}`, props.graphIndex);
        };

        return {
            selectedVariables,
            canDelete,
            removeVariable,
            getStyle,
            startDrag,
            endDrag,
            onDrop,
            deleteGraph
        };
    }
});
</script>

<style scoped lang="scss">
.graph-config-panel {
    border-width: 1px;
    border-style: solid;
    border-color: #ccc;
    padding: 4px;
    .graph-config-settings {
        margin-left: 8px;
    }
    .selected-variables-panel {
        width: 100%;

        .variable {
            font-size: large;
            cursor: pointer;
        }
    }
}
</style>
