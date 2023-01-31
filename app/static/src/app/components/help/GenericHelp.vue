<template>
  <draggable-dialog icon="help-circle" initial-collapsed="true" title-class="generic-help-header">
    <markdown-panel class="generic-help p-2 my-2" :markdown="[markdown]"></markdown-panel>
  </draggable-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import DraggableDialog from "./DraggableDialog.vue";
import MarkdownPanel from "./MarkdownPanel.vue";

export default defineComponent({
    name: "GenericHelp",
    components: {MarkdownPanel, DraggableDialog },
    props: {
        markdown: String
    }
});
</script>
