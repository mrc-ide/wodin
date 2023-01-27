<template>
  <vertical-collapse icon="help-circle" initial-collapsed="true" title-class="generic-help-header">
    <markdown-panel class="generic-help p-2 my-2" :markdown="[markdown]"></markdown-panel>
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
