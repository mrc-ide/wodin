<template>
    <vertical-collapse v-if="showGraphs" title="Graphs settings" collapse-id="graphs">
        <graph-configs></graph-configs>
    </vertical-collapse>
</template>

<script lang="ts">
import GraphConfigs from "@/components/graphConfig/GraphConfigs.vue";
import VerticalCollapse from "@/components/VerticalCollapse.vue";
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
    name: "GraphConfigsCollapsible",
    components: {
        GraphConfigs,
        VerticalCollapse
    },
    setup() {
        const store = useStore();
        const allVariables = computed<string[]>(() => store.state.model.odinModelResponse?.metadata?.variables || []);
        const showGraphs = computed(() => allVariables.value.length > 0 && !store.state.model.compileRequired);
        return {
            showGraphs
        };
    }
});
</script>
