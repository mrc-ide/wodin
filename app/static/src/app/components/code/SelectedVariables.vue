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
    </vertical-collapse>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import VerticalCollapse from "../VerticalCollapse.vue";
import {ModelMutation} from "../../store/model/mutations";

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

        const toggleVariable = (variable: string) => {
            console.log(`toggling ${variable}`)
            let newVars: string[];
            if (selectedVariables.value.includes(variable)) {
                console.log(`variable is already included`)
                newVars = selectedVariables.value.filter((v) => v !== variable);
            } else {
                console.log(`variable is not already included`)
                newVars = [...selectedVariables.value, variable];
            }
            console.log(`committing new vars: ${JSON.stringify(newVars)}`)
            store.commit(`model/${ModelMutation.SetSelectedVariables}`, newVars);
        };

        return {
            show,
            allVariables,
            getStyle,
            toggleVariable
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
