<template>
    <div class="selected-variables-panel m-2" @drop="onDrop($event)" @dragover.prevent @dragenter.prevent>
        <h5>
            {{ graphKey }}
            <button
                type="button"
                class="btn btn-light mx-2"
                style="background-color: #fff; border-width: 0"
                v-if="graphKey !== 'Graph 1'"
                @click="deleteGraph"
                v-tooltip="'Delete Graph'"
            >
                <vue-feather
                    class="inline-icon clickable delete-param-set ms-2 param-set-icon"
                    type="trash-2"
                ></vue-feather>
            </button>
        </h5>
        <div class="drop-zone" :class="draggingVar ? 'drop-zone-active' : 'drop-zone-inactive'">
            <template v-for="variable in allVariables" :key="variable">
                <span
                    v-if="selectedVariables.includes(variable)"
                    class="badge variable me-2 mb-2"
                    :style="getStyle(variable)"
                    :draggable="selectedVariables.includes(variable) ? true : false"
                    @dragstart="startDrag($event, variable)"
                    @dragend="endDrag"
                >
                    {{ variable }}
                    <span v-if="duplicateVariables.includes(variable)">
                        | <button class="variable-delete-button" @click="deleteVariable(variable)">×</button>
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
import { ModelAction } from "../../store/model/actions";
import VueFeather from "vue-feather";
import tooltip from "../../directives/tooltip";
import { ModelMutation } from "../../store/model/mutations";
import { ModelGetter } from "../../store/model/getters";

export default defineComponent({
    name: "SelectedVariables",
    computed: {
        tooltip() {
            return tooltip;
        }
    },
    components: { VueFeather },
    props: {
        graphKey: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const store = useStore();
        const allVariables = computed<string[]>(() => store.state.model.odinModelResponse?.metadata?.variables || []);
        const selectedVariables = computed<string[]>(() => store.state.model.graphs[props.graphKey].selectedVariables);
        const palette = computed(() => store.state.model.paletteModel!);
        const draggingVar = computed(() => store.state.model.draggingVariable);
        const duplicateVariables = computed(() => store.getters[`model/${ModelGetter.duplicateVariables}`]);

        const getStyle = (variable: string) => {
            let bgcolor = "#bbb"; // grey out unselected variables
            if (selectedVariables.value.includes(variable)) {
                bgcolor = palette.value[variable]!;
            }
            return { "background-color": bgcolor };
        };

        const updateSelectedVariables = (newVariables: string[]) => {
            store.dispatch(`model/${ModelAction.UpdateSelectedVariables}`, {
                key: props.graphKey,
                selectedVariables: newVariables
            });
        };

        const deleteGraph = () => {
            store.commit(`model/${ModelMutation.DeleteGraph}`, props.graphKey);
        };

        const toggleVariable = (variable: string) => {
            let newVars: string[];
            if (selectedVariables.value.includes(variable)) {
                newVars = selectedVariables.value.filter((v) => v !== variable);
            } else {
                newVars = [...selectedVariables.value, variable];
            }
            updateSelectedVariables(newVars);
        };

        const selectAll = () => {
            updateSelectedVariables([...allVariables.value]);
        };

        const selectNone = () => {
            updateSelectedVariables([]);
        };

        const startDrag = (evt: DragEvent, variable: string) => {
            const { dataTransfer } = evt;
            const copy = evt.ctrlKey;
            console.log(`started dragging ${variable} with ctrlKey ${copy}`);
            dataTransfer!!.dropEffect = "move";
            dataTransfer!!.effectAllowed = "move";
            dataTransfer!!.setData("variable", variable);
            dataTransfer!!.setData("srcGraph", props.graphKey);
            dataTransfer!!.setData("copyVar", copy.toString());

            store.commit(`model/${ModelMutation.SetDraggingVariable}`, true);
        };

        const endDrag = () => {
            store.commit(`model/${ModelMutation.SetDraggingVariable}`, false);
        };

        const removeVariable = (graph: string, variable: string) => {
            const srcVariables = [...store.state.model.graphs[graph].selectedVariables].filter((v) => v !== variable);
            store.dispatch(`model/${ModelAction.UpdateSelectedVariables}`, {
                key: graph,
                selectedVariables: srcVariables
            });
        };

        const deleteVariable = (variable: string) => {
            removeVariable(props.graphKey, variable);
        };

        const onDrop = (evt: DragEvent) => {
            const { dataTransfer } = evt;
            const variable = dataTransfer!!.getData("variable");
            const srcGraph = dataTransfer!!.getData("srcGraph");
            console.log(`copy on drop is ${dataTransfer!!.getData("copyVar")}`);
            const copy = dataTransfer!!.getData("copyVar") === "true";
            if (srcGraph !== props.graphKey) {
                // remove from source graph - but not if ctrl key was held on start drag
                if (srcGraph !== "hidden" && !copy) {
                    removeVariable(srcGraph, variable);
                }

                // add to this graph if necessary
                if (!selectedVariables.value.includes(variable)) {
                    toggleVariable(variable);
                }
            }
        };

        return {
            allVariables,
            selectedVariables,
            getStyle,
            toggleVariable,
            selectAll,
            selectNone,
            startDrag,
            endDrag,
            onDrop,
            deleteGraph,
            draggingVar,
            duplicateVariables,
            deleteVariable
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

.variable-delete-button {
    background-color: transparent;
    border-width: 0;
    color: white;
    font-weight: bold;
}
</style>
