<template>
    <div>
        <button v-if="defaultCodeExists"
                class="btn btn-primary btn-sm mb-2"
                id="reset-btn"
                @click="resetCode">Reset
        </button>
        <div class="editor-container mb-2">
            <div class="editor" ref="editor"></div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, onMounted, ref
} from "vue";
import { useStore } from "vuex";
import loader from "@monaco-editor/loader";
import * as monaco from "monaco-editor";
import Timeout = NodeJS.Timeout;
import { AppConfig } from "../../types/responseTypes";
import { CodeAction } from "../../store/code/actions";

export default defineComponent({
    name: "CodeEditor",

    setup() {
        const store = useStore();

        const editor = ref<null | HTMLElement>(null); // Picks up the element with 'plot' ref in the template

        const currentCode = computed(() => store.state.code.currentCode);
        const readOnly = computed(() => (store.state.config as AppConfig).readOnlyCode);
        const defaultCode = computed(() => (store.state.config as AppConfig).defaultCode);
        const defaultCodeExists = computed(() => defaultCode.value && (defaultCode.value.length && !readOnly.value));

        let newCode: string[] | null = null;
        let timeoutId: null | Timeout = null;
        let editorInstance: monaco.editor.IStandaloneCodeEditor;
        const updateCode = () => store.dispatch(`code/${CodeAction.UpdateCode}`, newCode, { root: true });

        const setPendingCodeUpdate = () => {
            if (!timeoutId) {
                timeoutId = setTimeout(() => {
                    updateCode();
                    timeoutId = null;
                }, 1000);
            }
        };

        const createMonacoEditor = () => {
            loader.init().then((monacoInstance) => {
                editorInstance = monacoInstance.editor.create(editor.value as HTMLElement, {
                    value: currentCode.value.join("\n"),
                    language: "r",
                    minimap: { enabled: false },
                    readOnly: readOnly.value
                });

                editorInstance.onDidChangeModelContent(() => {
                    newCode = editorInstance.getModel()!.getLinesContent();
                    setPendingCodeUpdate();
                });
            });
        };

        const resetCode = () => {
            editorInstance.setValue(defaultCode.value.join("\n"));
        };

        onMounted(() => {
            createMonacoEditor();
        });

        return {
            editor,
            readOnly,
            resetCode,
            defaultCodeExists
        };
    }
});
</script>
<style scoped lang="scss">
.editor-container {
  width: 100%;
  border: 1px solid #dee2e6;
}

.editor {
  width: 100%;
  height: 400px;
}
</style>
