<template>
  <monaco-editor
      class="editor"
      v-model="code"
      language="javascript" >
  </monaco-editor>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { VAceEditor } from "vue3-ace-editor";
import {AppConfig} from "../../types/responseTypes";
//import * as Mode from "ace-builds/src-noconflict/mode-json";
//import {config, edit} from "ace-builds";
//import workerJsonUrl from '../../../../node_modules/ace-builds/src-noconflict/worker-json.js'; // For webpack / vue-cli
//import {Mode } from 'ace-builds/src-noconflict/mode-json';
import MonacoEditor from 'vue-monaco';

interface changeEvent {
  lines: string[]
}

export default defineComponent({
    name: "CodeEditor.vue",
    components: {
        MonacoEditor
    },
    setup() {
        const store = useStore();
        //config.setModuleUrl('ace/mode/json_worker', workerJsonUrl);

        //const mode = new Mode();
        //edit(null).mode


        const code = computed(() => store.state.code.code.join("\n"));
        // TODO: what's the best way to handle readonly? Get it from base class config?
        const readOnly = computed(() => (store.state.config as AppConfig).readOnlyCode);

        const codeChanged = (ev: changeEvent) => {
          //console.log("code chnaged to: " + JSON.stringify(ev.lines))
        }

        return {
            code,
            readOnly,
            codeChanged
        };
    }
});
</script>
<style>
.editor {
  width: 300px;
  height: 400px;
}
</style>
