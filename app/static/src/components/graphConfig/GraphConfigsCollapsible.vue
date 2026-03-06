<template>
    <vertical-collapse v-if="showGraphs" title="Graphs settings" collapse-id="graphs">
        <config-group></config-group>
    </vertical-collapse>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import ConfigGroup from "./ConfigGroup.vue";
import VerticalCollapse from "@/components/VerticalCollapse.vue";

export default defineComponent({
    name: "GraphConfigsCollapsible",
    components: {
        ConfigGroup,
        VerticalCollapse,
    },
    setup() {
        const store = useStore();
        const showGraphs = computed(() => {
            const allVariables = store.state.model.odinModelResponse?.metadata?.variables || [];
            return allVariables.length > 0 && !store.state.model.compileRequired
        });
        return { showGraphs };
    }
});
</script>
