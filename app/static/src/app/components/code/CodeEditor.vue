<template>
  <div class="editor" ref="editor"></div>
</template>

<script lang="ts">
import {
    computed, defineComponent, onMounted, ref
} from "vue";
import { useStore } from "vuex";
import loader from "@monaco-editor/loader";
import { AppConfig } from "../../types/responseTypes";
import { CodeAction } from "../../store/code/actions";

export default defineComponent({
    name: "CodeEditor.vue",

    setup() {
        const store = useStore();

        const editor = ref<null | HTMLElement>(null); // Picks up the element with 'plot' ref in the template

        const currentCodeLines = computed(() => store.state.code.currentCode);
        const joinCodeLines = (lines: string[]) => lines.join("\n");
        const currentCode = computed(() => joinCodeLines(currentCodeLines.value));
        const readOnly = computed(() => (store.state.config as AppConfig).readOnlyCode);

        let newCode: string[] | null = null;
        let timeoutId: any = null;

        onMounted(() => {
            loader.init().then((monaco) => {
                const monacoEd = monaco.editor.create(editor.value as HTMLElement, {
                    value: currentCode.value,
                    language: "r",
                    minimap: { enabled: false },
                    readOnly: readOnly.value
                });
                monacoEd.onDidChangeModelContent(() => {
                    newCode = monacoEd.getModel()!.getLinesContent();
                    if (!timeoutId) {
                        timeoutId = setTimeout(() => {
                            store.dispatch(`code/${CodeAction.UpdateCode}`, newCode, { root: true });
                            timeoutId = null;
                        }, 2000);
                    }
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
.editor {
  width: 100%;
  height: 400px;
  border-width: 1px;
}
</style>
