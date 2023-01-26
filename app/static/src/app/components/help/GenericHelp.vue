<template>
  {{raw}}
</template>
<script lang="ts">
import { defineComponent } from "vue";
import code from "raw-loader!./code.md";

export default defineComponent({
    name: "GenericHelp",
    setup() {
        const raw = code;
        return {
            raw
        };
    }
});
</script>
