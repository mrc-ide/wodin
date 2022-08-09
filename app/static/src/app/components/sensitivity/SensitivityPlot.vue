<template>
  <div>
    There are {{solutions.length}} sensitivity solutions
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
    name: "SensitivityPlot",
    setup() {
        const store = useStore();
        const solutions = computed(() => store.state.sensitivity.batch?.solutions || []);
        return {
            solutions
        };
    }
});
</script>
