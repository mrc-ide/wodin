<template>
    <div class="selected-variables-panel m-2" @drop="onDrop($event)" @dragover.prevent @dragenter.prevent>
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
            <div v-if="!hiddenVariables.length" style="height: 3rem; background-color: #eee" class="p-2 me-4">
                Drag variables here to hide them on all graphs.
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import VueFeather from "vue-feather";
import tooltip from "../../directives/tooltip";
import * as Color from "color";
import { GraphsGetter } from "../../store/graphs/getters";
import { GraphsAction } from "../../store/graphs/actions";

export default defineComponent({
    name: "HiddenVariables",
    computed: {
        tooltip() {
            return tooltip;
        }
    },
    components: { VueFeather },
    props: {
        dragging: {
            type: Boolean,
            required: true
        }
    },
    setup(props, { emit }) {
        const store = useStore();
        const hiddenVariables = computed<string[]>(() => store.getters[`graphs/${GraphsGetter.hiddenVariables}`]);
        const palette = computed(() => store.state.model.paletteModel!);

        const getStyle = (variable: string) => {
            const bgcolor = palette.value ? palette.value[variable] : "#eee";
            const desatBgColor = Color(bgcolor).desaturate(0.6).fade(0.4).rgb().string();
            return { "background-color": desatBgColor };
        };

        // TODO: share code with selectedVariables - but remember hidden won't need copy but Selected will, and some other differences
        const startDrag = (evt: DragEvent, variable: string) => {
            const { dataTransfer } = evt;
            dataTransfer!!.dropEffect = "move";
            dataTransfer!!.effectAllowed = "move";
            dataTransfer!!.setData("variable", variable);
            dataTransfer!!.setData("srcGraph", "hidden");

            emit("setDragging", true);
        };

        const endDrag = () => {
            emit("setDragging", false);
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
                store.dispatch(`model/${GraphsAction.UpdateSelectedVariables}`, {
                    index: srcGraph,
                    selectedVariables: srcVariables
                });
            }
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
