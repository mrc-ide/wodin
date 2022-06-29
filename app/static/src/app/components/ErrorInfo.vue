<template>
  <div class="small text-danger">{{displayError}}</div>
</template>

<script>
import { defineComponent, computed } from "vue";

export default defineComponent({
    name: "ErrorInfo.vue",
    props: {
        error: Object
    },
    setup(props) {
        const displayError = computed(() => (props.error ? `${props.error.error}: ${props.error.details}` : ""));

        return { displayError };
    }
});
</script>
