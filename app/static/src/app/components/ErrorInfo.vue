<template>
    <div id="error-info" class="small text-danger mt-2">{{ displayError }}</div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

export default defineComponent({
    name: "ErrorInfo",
    props: {
        error: Object
    },
    setup(props) {
        const displayError = computed(() => (props.error ? `${props.error.error}: ${props.error.detail}` : ""));

        return { displayError };
    }
});
</script>
