<template>
    <template v-if="fitTabIsOpen">
        <graph-settings
            :key="JSON.stringify(fitGraph.config)"
            :graph="fitGraph"
            class="graph-config-settings mb-1"
        ></graph-settings>
    </template>
    <template v-else>
        <div id="graph-configs-instruction" class="ms-2">
            Drag variables to 'Hidden variables' to remove them from your graph, or click 'Add Graph' to create a new graph
            to move them to.
        </div>
        <graph-config
            v-for="graph in graphs"
            :graph="graph"
            :key="JSON.stringify(graph.config)"
            :dragging="draggingVariable"
            @setDragging="setDraggingVariable"
        ></graph-config>
        <button class="btn btn-primary mt-2 ms-2" id="add-graph-btn" @click="addGraph">
            <vue-feather size="20" class="inline-icon" type="plus"></vue-feather>
            Add Graph
        </button>
        <hidden-variables @setDragging="setDraggingVariable" :dragging="draggingVariable"></hidden-variables>
    </template>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";
import VueFeather from "vue-feather";
import HiddenVariables from "./HiddenVariables.vue";
import GraphConfig from "./GraphConfig.vue";
import { GraphsAction } from "../../store/graphs/actions";
import { AppState, VisualisationTab } from "@/store/appState/state";
import GraphSettings from "../GraphSettings.vue";

export default defineComponent({
    components: {
        VueFeather,
        GraphConfig,
        HiddenVariables,
        GraphSettings
    },
    setup() {
        const store = useStore<AppState>();
        const fitTabIsOpen = computed(() => store.state.openVisualisationTab === VisualisationTab.Fit);
        const draggingVariable = ref(false); // indicates whether a child component is dragging a variable
        const setDraggingVariable = (value: boolean) => {
            draggingVariable.value = value;
        };
        const graphs = computed(() => store.state.graphs.graphs);
        const fitGraph = computed(() => store.state.graphs.fitGraph);
        const addGraph = () => {
            store.dispatch(`graphs/${GraphsAction.NewGraph}`);
        };
        return {
            draggingVariable,
            setDraggingVariable,
            graphs,
            addGraph,
            fitTabIsOpen,
            fitGraph
        };
    }
});
</script>
