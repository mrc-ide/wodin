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
        <graph-settings :graph="graph" class="graph-config-settings mb-1"></graph-settings>
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
                        <button @click="removeVariable(graph.id, variable)" v-tooltip="'Remove variable'">×</button>
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
import { computed, defineComponent, PropType } from "vue";
import { useStore } from "vuex";
import GraphSettings from "@/components/GraphSettings.vue";
import SelectVariables from "../mixins/selectVariables";
import { GraphsMutation } from "../../store/graphs/mutations";
import { Graph } from "../../store/graphs/state";

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
        graph: {
            type: Object as PropType<Graph>,
            required: true
        }
    },
    setup(props, { emit }) {
        const store = useStore();
        // eslint-disable-next-line vue/no-setup-props-destructure
        const { startDrag, endDrag, onDrop, removeVariable } = SelectVariables(store, emit, false, props.graph);
        const selectedVariables = computed<string[]>(() => props.graph.config.selectedVariables);
        const canDelete = computed(() => store.state.graphs.graphs.length > 1);
        const palette = computed(() => store.state.model.paletteModel!);

        const getStyle = (variable: string) => {
            let bgcolor = "#bbb"; // grey out unselected variables
            if (selectedVariables.value.includes(variable)) {
                bgcolor = palette.value[variable]!;
            }
            return { "background-color": bgcolor };
        };

        const deleteGraph = () => {
            store.commit(`graphs/${GraphsMutation.DeleteGraph}`, props.graph.id);
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
    .selected-variables-panel {
        width: 100%;

        .variable {
            font-size: large;
            cursor: pointer;
        }
    }
}
</style>
