<template>
    <div>
        <code-editor/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CodeEditor from "./CodeEditor.vue";

export default defineComponent({
    name: "CodeTab",
    components: {
        CodeEditor
    }
});
</script>
