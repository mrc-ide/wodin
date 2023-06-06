<template>
    <button :disabled="loading || isDisabled">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        <slot></slot>
    </button>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        loading: Boolean,
        isDisabled: Boolean
    }
})
</script>