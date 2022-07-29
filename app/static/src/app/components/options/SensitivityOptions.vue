<template>
  {{JSON.stringify(settings)}}
</template>

<script lang="ts">
import { useStore } from "vuex";
import {computed, defineComponent} from "vue";

export default defineComponent({
  name: "SensitivityOptions",
  setup() {
    const store = useStore();
    const settings = computed(() => store.sensitivity.settings);

    return {
      settings
    };
  }
});
</script>

