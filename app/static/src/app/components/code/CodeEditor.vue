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

interface changeEvent {
  lines: string[]
}

export default defineComponent({
    name: "CodeEditor.vue",

    setup() {
        const store = useStore();

        const editor = ref<null | HTMLElement>(null); // Picks up the element with 'plot' ref in the template

        const code = computed(() => store.state.code.code.join("\n"));
        // TODO: what's the best way to handle readonly? Get it from base class config?
        const readOnly = computed(() => (store.state.config as AppConfig).readOnlyCode);

        // const codeChanged = (ev: changeEvent) => {
        // console.log("code chnaged to: " + JSON.stringify(ev.lines))
        // };

        onMounted(() => {
            loader.init().then((monaco) => {
                const monacoEd = monaco.editor.create(editor.value as HTMLElement, {
                    value: code.value,
                    language: "r",
                    minimap: { enabled: false },
                    readOnly: readOnly.value
                });
                monacoEd.onDidChangeModelContent(() => {
                    const newCode = monacoEd.getModel()!.getLinesContent();
                    console.log(`New code: ${JSON.stringify(newCode)}`);
                    if (newCode !== )
                    store.commit("code/SetCode", newCode, {root: true});
                    //store.dispatch("model/RunModel");
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
