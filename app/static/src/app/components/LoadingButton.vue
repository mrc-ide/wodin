<template>
  <button :disabled="loading || isDisabled" class="loading-btn">
    <span v-if="loading" class="spinner-border loading-spinner" role="status" aria-hidden="true"></span>
    <div :class="loading ? 'hidden-loading' : ''">
      <slot></slot>
    </div>
  </button>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    loading: Boolean,
    isDisabled: Boolean
  }
});
</script>
<style scoped>
.hidden-loading {
  visibility: hidden;
}
.loading-btn {
  position: relative;
}
.loading-spinner {
  position: absolute;
  height: 1.25rem;
  width: 1.25rem;
  left: calc(50% - 0.625rem);
  top: calc(50% - 0.625rem);
}
</style>
