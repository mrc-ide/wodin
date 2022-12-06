<template>
<div class="container">
  <div class="card">
    <div class="card-header">{{parameterSet.name}}</div>
    <div class="card-body">
       <span v-for="paramName in paramNames">
         <strong>{{paramName}}</strong> {{parameterSet.parameterValues[paramName]}}
       </span>
    </div>
  </div>
</div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType} from "vue";
import { ParameterSet } from "../../store/run/state";

export default defineComponent({
  name: "ParameterSet",
  props: {
    parameterSet: {
      type: Object as PropType<ParameterSet>,
      required: true
    }
  },
  setup(props) {
    const paramNames = computed(() => Object.keys(props.parameterSet.parameterValues));
    return {
      paramNames
    };
  }
});
</script>