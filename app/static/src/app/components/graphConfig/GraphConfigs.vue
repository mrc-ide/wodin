<template>
  <vertical-collapse v-if="showGraphs" title="Graphs" collapse-id="graphs">
    <div class="ms-2">
      Drag variables to 'Hidden variables' to remove them from your graph, or click 'Add Graph' to create a
      new graph to move them to.
    </div>
    <graph-config
        v-for="(_, index) in graphConfigs"
        :graph-index="index"
        :key="index"
        :dragging="draggingVariable"
        @setDragging="setDraggingVariable"
    ></graph-config>
    <button class="btn btn-primary mt-2 ms-2" id="add-graph-btn" @click="addGraph">
      <vue-feather size="20" class="inline-icon" type="plus"></vue-feather>
      Add Graph
    </button>
    <hidden-variables
        @setDragging="setDraggingVariable"
        :dragging="draggingVariable"
    ></hidden-variables>
  </vertical-collapse>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from "vue";
import {useStore} from "vuex";
import VueFeather from "vue-feather";
import VerticalCollapse from "../VerticalCollapse.vue";
import HiddenVariables from "./HiddenVariables.vue";
import GraphConfig from "./GraphConfig.vue";
import {GraphsAction} from "../../store/graphs/actions";

export default defineComponent({
  components: {
    VueFeather,
    GraphConfig,
    HiddenVariables,
    VerticalCollapse
  },
  setup() {
    const store = useStore();
    const allVariables = computed<string[]>(() => store.state.model.odinModelResponse?.metadata?.variables || []);
    const showGraphs = computed(() => allVariables.value.length && !store.state.model.compileRequired);
    const draggingVariable = ref(false); // indicates whether a child component is dragging a variable
    const setDraggingVariable = (value: boolean) => (draggingVariable.value = value);
    const graphConfigs = computed(() => store.state.graphs.config);
    const addGraph = () => {
      store.dispatch(`graphs/${GraphsAction.NewGraph}`);
    };
    return {
      showGraphs,
      draggingVariable,
      setDraggingVariable,
      graphConfigs,
      addGraph
    };
  }
});
</script>