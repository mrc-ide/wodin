<template>
    <vertical-collapse v-if="showGraphs" title="Graphs" collapse-id="graphs">
        <graph-configs></graph-configs>
    </vertical-collapse>
</template>

<script lang="ts">
import GraphConfigs from "@/app/components/graphConfig/GraphConfigs.vue";
import VerticalCollapse from "@/app/components/VerticalCollapse.vue";
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
        const showGraphs = computed(() => allVariables.value.length && !store.state.model.compileRequired);
        return {
            showGraphs
        };
    }
});
</script>
