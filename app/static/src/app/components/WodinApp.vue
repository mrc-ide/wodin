<template>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <div v-if="loading" class="text-center center-of-screen">
          <loading-spinner size="lg"></loading-spinner>
          <h2 id="loading-message">Loading application...</h2>
        </div>
        <errors-alert></errors-alert>
        <wodin-panels v-if="!loading">
          <template v-slot:left>
            <slot name="left"></slot>
          </template>
          <template v-slot:right>
            <slot name="right"></slot>
          </template>
        </wodin-panels>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import ErrorsAlert from "./ErrorsAlert.vue";
import WodinPanels from "./WodinPanels.vue";
import LoadingSpinner from "./LoadingSpinner.vue";

export default defineComponent({
  name: "WodinApp",
  components: {
    LoadingSpinner,
    ErrorsAlert,
    WodinPanels
  },
  setup() {
    const store = useStore();

    const appType = computed(() => store.state.appType);
    const loading = computed(() => !store.state.config);

    return {
      appType,
      loading
    };
  }
});
</script>
<style lang="scss">
@import "src/scss/style";
.center-of-screen {
  position: fixed;
  top: calc(50% - 100px);
  left: calc(50% - 100px);
}
</style>
