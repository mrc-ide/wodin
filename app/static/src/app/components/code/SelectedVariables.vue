<template>
  <div v-if="show" class="mt-3" >
    <vertical-collapse title="Select variables" collapse-id="select-variables">
      <div class="ms-2">Click to toggle variables to include in graphs.</div>
      <div class="selected-variables-panel m-2">
        <span v-for="variable in allVariables"
              class="badge variable me-2 mb-2"
              :style="getStyle(variable)"
              @click="toggleVariable(variable)">{{variable}}</span>
      </div>
      <div class="ms-2">
        <span class="clickable text-primary" @click="selectAll">Select all</span> |
        <span class="clickable text-primary" @click="selectNone">Select none</span>
      </div>
    </vertical-collapse>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import VerticalCollapse from "../VerticalCollapse.vue";
import {ModelMutation} from "../../store/model/mutations";
import {ModelAction} from "../../store/model/actions";

export default defineComponent({
    name: "SelectedVariables",
    components: { VerticalCollapse },
    setup() {
        const store = useStore();
        const allVariables = computed<string[]>(() => store.state.model.odinModelResponse?.metadata.variables || []);
        const selectedVariables = computed<string[]>(() => (store.state.model.selectedVariables));
        const palette = computed(() => store.state.model.paletteModel!);
        const show = computed(() => allVariables.value.length && !store.state.model.compileRequired);

        const getStyle = (variable: string) => {
            let bgcolor = "#bbb"; // grey out unselected variables
            if (selectedVariables.value.includes(variable)) {
               bgcolor = palette.value[variable]!;
            }
            return { "background-color": bgcolor };
        };

        const updateSelectedVariables = (newVariables: string[]) => {
          store.dispatch(`model/${ModelAction.UpdateSelectedVariables}`, newVariables);
        };

        const toggleVariable = (variable: string) => {
            let newVars: string[];
            if (selectedVariables.value.includes(variable)) {
                newVars = selectedVariables.value.filter((v) => v !== variable);
            } else {
                newVars = [...selectedVariables.value, variable];
            }
            updateSelectedVariables(newVars);
        };

        const selectAll = () => {
          updateSelectedVariables([...allVariables.value]);
        };

        const selectNone = () => {
          updateSelectedVariables([]);
        };

        return {
            show,
            allVariables,
            getStyle,
            toggleVariable,
            selectAll,
            selectNone
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
