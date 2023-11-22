<template>
    <markdown-panel :markdown="appHelp"></markdown-panel>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import MarkdownPanel from "./MarkdownPanel.vue";

export default defineComponent({
    name: "HelpTab",
    components: { MarkdownPanel },
    setup() {
        const store = useStore();
        const appHelp = computed(() => store.state.config?.help?.markdown);
        return {
            appHelp
        };
    }
});
</script>
