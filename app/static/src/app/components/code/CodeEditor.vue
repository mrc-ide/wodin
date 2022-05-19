<template>
  <div class="editor" ref="editor"></div>
</template>

<script lang="ts">
import {
  computed, defineComponent, onMounted, ref, watch
} from "vue";
import { useStore } from "vuex";
import loader from "@monaco-editor/loader";
import { AppConfig } from "../../types/responseTypes";
import {CodeAction} from "../../store/code/actions";

export default defineComponent({
    name: "CodeEditor.vue",

    setup() {
        const store = useStore();

        const editor = ref<null | HTMLElement>(null); // Picks up the element with 'plot' ref in the template

        const code = computed(() => store.state.code.code.join("\n"));
        const readOnly = computed(() => (store.state.config as AppConfig).readOnlyCode);

        onMounted(() => {
            loader.init().then((monaco) => {
                const monacoEd = monaco.editor.create(editor.value as HTMLElement, {
                    value: code.value,
                    language: "r",
                    minimap: { enabled: false },
                    readOnly: readOnly.value
                });
                monacoEd.onDidChangeModelContent(() => {
                    //TODO: buffer updates for ~2sec
                    //TODO: deal with validation errors - error currently logged to console,
                    // Should it hide previous visualisation if current code has errors?
                    const newCode = monacoEd.getModel()!.getLinesContent();
                    if (newCode !== code.value) {
                      store.dispatch(`code/${CodeAction.UpdateCode}`, newCode, {root: true});
                    }
                });
            });
        });

        return {
            editor,
            code,
            readOnly
        };
    }
});
</script>
<style>
.editor {
  width: 100%;
  height: 400px;
}
</style>
