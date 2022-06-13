<template>
  <div class="container">
    <div v-for="paramName in paramNames" class="row" :key="paramName">
      <div class="col-6">
        <label>{{paramName}}</label>
      </div>
      <div class="col-6">
        <input type="number" :value="paramValues[paramName]"/>
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
        const paramNames = computed(() => Object.keys(paramValues.value)); //TODO: use rank

        return {
            paramValues,
            paramNames
        };
    }
});
</script>
