<template>
  <div class="editor-container mb-2">
    <div class="editor" ref="editor"></div>
  </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, onMounted, ref
} from "vue";
import { useStore } from "vuex";
import loader from "@monaco-editor/loader";
import Timeout = NodeJS.Timeout;
import { AppConfig } from "../../types/responseTypes";
import { CodeAction } from "../../store/code/actions";

export default defineComponent({
    name: "CodeEditor.vue",

    setup() {
        const store = useStore();

        const editor = ref<null | HTMLElement>(null); // Picks up the element with 'plot' ref in the template

        const currentCode = computed(() => store.state.code.currentCode);
        const readOnly = computed(() => (store.state.config as AppConfig).readOnlyCode);

        let newCode: string[] | null = null;
        let timeoutId: null | Timeout = null;

        const setPendingCodeUpdate = () => {
            if (!timeoutId) {
                timeoutId = setTimeout(() => {
                    store.dispatch(`code/${CodeAction.UpdateCode}`, newCode, { root: true });
                    timeoutId = null;
                }, 1000);
            }
        };

        onMounted(() => {
            loader.init().then((monaco) => {
                const monacoEd = monaco.editor.create(editor.value as HTMLElement, {
                    value: currentCode.value.join("\n"),
                    language: "r",
                    minimap: { enabled: false },
                    readOnly: readOnly.value
                });
                monacoEd.onDidChangeModelContent(() => {
                    newCode = monacoEd.getModel()!.getLinesContent();
                    setPendingCodeUpdate();
                });
            });
        });

        return {
            editor,
            readOnly
        };
    }
});
</script>
<style>
.editor-container {
  width: 100%;
  border: 1px solid #dee2e6;
}

.editor {
  width: 100%;
  height: 400px;
}
</style>
