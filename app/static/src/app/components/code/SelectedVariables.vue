<template>
    <div class="selected-variables-panel m-2" @drop="onDrop($event)" @dragover.prevent @dragenter.prevent>
        <h5>
            {{ graphKey }}
            <button
                type="button"
                class="btn btn-light mx-2"
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
        <span
            v-for="variable in allVariables"
            class="badge variable me-2 mb-2"
            :style="getStyle(variable)"
            :key="variable"
            :draggable="selectedVariables.includes(variable) ? true : false"
            @dragstart="startDrag($event, variable)"
            @click="toggleVariable(variable)"
        >
            {{ variable }}
        </span>
    </div>
    <div class="ms-2">
        <span class="clickable text-primary" id="select-variables-all" @click="selectAll">Select all</span> |
        <span class="clickable text-primary" id="select-variables-none" @click="selectNone">Select none</span>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { ModelAction } from "../../store/model/actions";
import VueFeather from "vue-feather";
import tooltip from "../../directives/tooltip";
import { ModelMutation } from "../../store/model/mutations";

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
            console.log(`started dragging ${variable}`);
            const { dataTransfer } = evt;
            dataTransfer!!.dropEffect = "move";
            dataTransfer!!.effectAllowed = "move";
            dataTransfer!!.setData("variable", variable);
            dataTransfer!!.setData("srcGraph", props.graphKey);
        };

        const onDrop = (evt: DragEvent) => {
            const { dataTransfer } = evt;
            const variable = dataTransfer!!.getData("variable");
            const srcGraph = dataTransfer!!.getData("srcGraph");
            if (srcGraph !== props.graphKey) {
                // remove from source graph
                const srcVariables = [...store.state.model.graphs[srcGraph].selectedVariables].filter(
                    (v) => v !== variable
                );
                store.dispatch(`model/${ModelAction.UpdateSelectedVariables}`, {
                    key: srcGraph,
                    selectedVariables: srcVariables
                });

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
            onDrop,
            deleteGraph
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
