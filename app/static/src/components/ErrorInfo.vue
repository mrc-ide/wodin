<template>
    <div id="error-info" class="small text-danger mt-2">{{ displayError }}</div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import { WodinError } from "../types/responseTypes"

export default defineComponent({
    name: "ErrorInfo",
    props: {
        error: Object as PropType<WodinError | null | undefined>
    },
    setup(props) {
        const displayError = computed(() => (props.error ? `${props.error.error}: ${props.error.detail}` : ""));

        return { displayError };
    }
});
</script>
