<template>
    <div class="selected-variables-panel m-2" @drop="onDrop($event)" @dragover.prevent @dragenter.prevent>
        <h5>Graph {{ graphIndex + 1 }}</h5>
        <div class="drop-zone" :class="dragging ? 'drop-zone-active' : 'drop-zone-inactive'">
            <template v-for="variable in selectedVariables" :key="variable">
                <span
                    class="badge variable me-2 mb-2"
                    :style="getStyle(variable)"
                    :draggable="true"
                    @dragstart="startDrag($event, variable)"
                    @dragend="endDrag"
                >
                    {{ variable }}
                    <span class="variable-delete">
                      <button @click="removeVariable(graphIndex, variable)" v-tooltip="'Remove variable'">×</button>
                    </span>
                </span>
            </template>
            <div v-if="!selectedVariables.length" style="height: 3rem; background-color: #eee" class="p-2 me-4">
                Drag variables here to select them for this graph.
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { GraphsAction } from "../../store/graphs/actions";

// TODO: rename this component?
export default defineComponent({
    name: "SelectedVariables",
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
        const selectedVariables = computed<string[]>(
            () => store.state.graphs.config[props.graphIndex].selectedVariables
        );
        const palette = computed(() => store.state.model.paletteModel!);

        const getStyle = (variable: string) => {
            let bgcolor = "#bbb"; // grey out unselected variables
            if (selectedVariables.value.includes(variable)) {
                bgcolor = palette.value[variable]!;
            }
            return { "background-color": bgcolor };
        };

        const updateSelectedVariables = (graphIndex: number, newVariables: string[]) => {
            store.dispatch(`graphs/${GraphsAction.UpdateSelectedVariables}`, {
                graphIndex,
                selectedVariables: newVariables
            });
        };

        const startDrag = (evt: DragEvent, variable: string) => {
            const { dataTransfer } = evt;
            dataTransfer!!.dropEffect = "move";
            dataTransfer!!.effectAllowed = "move";
            dataTransfer!!.setData("variable", variable);
            dataTransfer!!.setData("srcGraph", props.graphIndex.toString());
            emit("setDragging", true);
        };

        // TODO: share the drag stuff with HiddenVariables
        const endDrag = () => {
            emit("setDragging", false);
        };

        // Remove variable from the graph it was dragged from
        const removeVariable = (srcGraphIdx: number, variable: string) => {
            const srcVariables = [...store.state.graphs.config[srcGraphIdx].selectedVariables].filter(
                (v) => v !== variable
            );
            updateSelectedVariables(srcGraphIdx, srcVariables);
        };

        const onDrop = (evt: DragEvent) => {
            const { dataTransfer } = evt;
            const variable = dataTransfer!!.getData("variable");
            const srcGraph = dataTransfer!!.getData("srcGraph");
            if (srcGraph !== props.graphIndex.toString()) {
                // remove from source graph
                if (srcGraph !== "hidden") {
                    removeVariable(parseInt(srcGraph), variable);
                }
                // add to this graph if necessary
                if (!selectedVariables.value.includes(variable)) {
                    const newVars = [...selectedVariables.value, variable];
                    updateSelectedVariables(props.graphIndex, newVars);
                }
            }
        };

        return {
            selectedVariables,
            removeVariable,
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
