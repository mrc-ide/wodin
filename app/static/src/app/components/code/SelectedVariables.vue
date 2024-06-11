<template>
    <div class="selected-variables-panel m-2" @drop="onDrop($event)" @dragover.prevent @dragenter.prevent>
        <h5>{{ graphKey }}</h5>
        <span
            v-for="variable in allVariables"
            class="badge variable me-2 mb-2"
            :style="getStyle(variable)"
            :key="variable"
            draggable="true"
            @dragstart="startDrag($event, variable)"
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

export default defineComponent({
    name: "SelectedVariables",
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
            evt!!.dataTransfer!!.dropEffect = "move";
            evt!!.dataTransfer!!.effectAllowed = "move";
            evt!!.dataTransfer!!.setData("variable", variable);
        };

        const onDrop = (evt: DragEvent) => {
            const variable = evt.dataTransfer!!.getData("variable");
            console.log(`${variable} got dropped!`);
        };

        return {
            allVariables,
            getStyle,
            toggleVariable,
            selectAll,
            selectNone,
            startDrag,
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
