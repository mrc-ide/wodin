<template>
    <vertical-collapse v-if="showGraphs && inGraphTab" title="Graphs settings" collapse-id="graphs">
        <config-group></config-group>
    </vertical-collapse>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import ConfigGroup from "./ConfigGroup.vue";
import VerticalCollapse from "@/components/VerticalCollapse.vue";
import { AppState, VisualisationTab } from "@/store/appState/state";

const graphTabs = [VisualisationTab.Run, VisualisationTab.Fit, VisualisationTab.Sensitivity];

export default defineComponent({
    name: "GraphConfigsCollapsible",
    components: {
        ConfigGroup,
        VerticalCollapse,
    },
    setup() {
        const store = useStore<AppState>();
        const showGraphs = computed(() => {
            const allVariables = store.state.model.odinModelResponse?.metadata?.variables || [];
            return allVariables.length > 0 && !store.state.model.compileRequired
        });
        const inGraphTab = computed(() => graphTabs.includes(store.state.openVisualisationTab));
        return { showGraphs, inGraphTab };
    }
});
</script>
