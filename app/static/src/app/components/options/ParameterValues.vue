<template>
  <div class="container">
    <div v-for="paramName in paramNames" class="row my-2" :key="paramName">
      <div class="col-6">
        <label class="col-form-label">{{paramName}}</label>
      </div>
      <div class="col-6">
        <input class="form-control" type="number" :value="paramValues[paramName]" @input="updateValue($event, paramName)"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";

export default defineComponent({
    name: "ParameterValues",
    setup() {
        const store = useStore();
        const paramValues = computed(() => store.state.model.parameterValues);
        const paramNames = computed(() => Object.keys(paramValues.value)); // TODO: use rank

        const updateValue = (e: Event, paramName: string) => {
            const newValue = parseFloat((e.target as HTMLInputElement).value);
            console.log("new value: " + newValue);
            store.commit("model/UpdateParameterValues", { [paramName]: newValue });
        };

        return {
            paramValues,
            paramNames,
            updateValue
        };
    }
});
</script>
