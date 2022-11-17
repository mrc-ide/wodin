<template>
  <div v-if="allVariables.length">
    <vertical-collapse title="Select variables" collapse-id="select-variables">
      <div class="ms-2">Click to toggle variables to include in graphs.</div>
      <div class="selected-variables-panel m-2">
        <span v-for="variable in allVariables" class="badge variable me-2" :style="getStyle(variable)">{{variable}}</span>
      </div>
    </vertical-collapse>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import VerticalCollapse from "../VerticalCollapse.vue";

export default defineComponent({
    name: "SelectedVariables",
    components: { VerticalCollapse },
    setup() {
        const store = useStore();
        const allVariables = computed(() => store.state.model.odinModelResponse?.metadata.variables || []);
        const selectedVariables = computed(() => (store.state.model.selectedVariables || []));
        const getStyle = (variable: string) => {
            let bgcolor = "#e8ebee";
            if (selectedVariables.value.indexOf(variable) > -1) {
              // TODO: find colour in palette
                bgcolor = "#7777ff";
            }
            return { "background-color": bgcolor };
        };

        return {
            allVariables,
            getStyle
        };
    }
});
</script>

<style scoped lang="scss">
  .selected-variables-panel {
    width: 100%;

    .variable {
      font-size: large;
      cursor: pointer;
    }
  }
</style>
