<template>
  <div class="container">
    <div v-for="(paramName, index) in paramNames" class="row my-2" :key="paramKeys[index]">
      <div class="col-6">
        <label class="col-form-label">{{paramName}}</label>
      </div>
      <div class="col-6">
        <input class="form-control parameter-input"
               type="number"
               :value="paramValues.get(paramName)"
               @input="updateValue($event, paramName)"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
    defineComponent, computed, watch, ref
} from "vue";
import { useStore } from "vuex";
import { ModelMutation } from "../../store/model/mutations";

export default defineComponent({
    name: "ParameterValues",
    setup() {
        const store = useStore();
        const paramValues = computed(() => store.state.model.parameterValues);
        const paramNames = computed(() => Array.from(paramValues.value.keys()) as string[]);

        const timestampParamNames = () => paramNames.value.map((name: string) => name + Date.now());

        const paramKeys = ref(timestampParamNames());
        const odinSolution = computed(() => store.state.model.odinSolution);

        const updateValue = (e: Event, paramName: string) => {
            const input = e.target as HTMLInputElement;
            const newValue = parseFloat(input.value);
            // Do not send update if user has cleared the numeric input. Refresh inputs on next run
            if (!Number.isNaN(newValue)) {
                store.commit(`model/${ModelMutation.UpdateParameterValues}`, { [paramName]: newValue });
            }
        };

        watch(odinSolution, () => {
            // force inputs to update when model is run to show actual values
            paramKeys.value = timestampParamNames();
        });

        return {
            paramValues,
            paramNames,
            paramKeys,
            updateValue
        };
    }
});
</script>
