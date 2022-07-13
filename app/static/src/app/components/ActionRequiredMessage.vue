<template>
  <div class="action-required-msg text-danger text-center">
    <span v-if="message" class="p-1">{{message}}</span>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ActionRequiredMessage",
  props: {
    message: String
  }
});
</script>
<style scoped lang="scss">
.action-required-msg {
  min-height:1.6rem;
  span {
    border: 1px solid #dee2e6;
  }
}
</style>
