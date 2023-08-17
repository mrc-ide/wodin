<template>
  <vue-feather type="help-circle"
               v-tooltip="'Display help'"
               class="generic-help-icon float-end clickable mb-2"
               @click="toggleDialog(true)"></vue-feather>
  <draggable-dialog v-if="show"
                    :title = "title"
                    @close="toggleDialog(false)">
    <markdown-panel class="p-2 my-2" :markdown="[markdown]"></markdown-panel>
  </draggable-dialog>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import VueFeather from "vue-feather";
import DraggableDialog from "./DraggableDialog.vue";
import MarkdownPanel from "./MarkdownPanel.vue";

export default defineComponent({
    name: "GenericHelp", // Generic long-form help for Wodin functionality, as opposed to configured app-specific help
    components: { MarkdownPanel, DraggableDialog, VueFeather },
    props: {
        title: String,
        markdown: String
    },
    setup() {
        const show = ref(false);
        const toggleDialog = (showDialog: boolean) => {
            show.value = showDialog;
        };

        return {
            show,
            toggleDialog
        };
    }
});
</script>
