<template>
  <vertical-collapse title="?" initial-collapsed="true">
    <markdown-panel :markdown="[markdown]"></markdown-panel>
  </vertical-collapse>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import VerticalCollapse from "../VerticalCollapse.vue";
import MarkdownPanel from "./MarkdownPanel.vue";

export default defineComponent({
    name: "GenericHelp",
    components: {MarkdownPanel, VerticalCollapse },
    props: {
        markdown: String
    }
});
</script>
