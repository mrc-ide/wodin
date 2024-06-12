<template>
    <div class="selected-variables-panel m-2" @drop="onDrop($event)" @dragover.prevent @dragenter.prevent>
        <h5>Hidden variables</h5>
        <template v-for="variable in hiddenVariables" :key="variable">
            <span
                class="badge variable me-2 mb-2"
                :style="getStyle(variable)"
                draggable="true"
                @dragstart="startDrag($event, variable)"
            >
                {{ variable }}
            </span>
        </template>
        <div v-if="!hiddenVariables.length" style="height: 3rem; background-color: #eee" class="p-2 me-4">
            Drag variables here to hide them on all graphs.
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
    setup(props) {
        const store = useStore();
        const hiddenVariables = computed<string[]>(() => store.getters[`model/${ModelGetter.unselectedVariables}`]);
        const palette = computed(() => store.state.model.paletteModel!);

        const getStyle = (variable: string) => {
            const bgcolor = palette.value ? palette.value[variable] : "#eee";
            return { "background-color": bgcolor };
        };

        const startDrag = (evt: DragEvent, variable: string) => {
            console.log(`started dragging ${variable}`);
            const { dataTransfer } = evt;
            dataTransfer!!.dropEffect = "move";
            dataTransfer!!.effectAllowed = "move";
            dataTransfer!!.setData("variable", variable);
            dataTransfer!!.setData("srcGraph", "hidden");
        };

        const onDrop = (evt: DragEvent) => {
            const { dataTransfer } = evt;
            const variable = dataTransfer!!.getData("variable");
            const srcGraph = dataTransfer!!.getData("srcGraph");
            if (srcGraph !== "hidden") {
                // remove from source graph
                const srcVariables = [...store.state.model.graphs[srcGraph].selectedVariables].filter(
                    (v) => v !== variable
                );
                store.dispatch(`model/${ModelAction.UpdateSelectedVariables}`, {
                    key: srcGraph,
                    selectedVariables: srcVariables
                });
            }
        };

        return {
            hiddenVariables,
            getStyle,
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
