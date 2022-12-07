<template>
<div class="container parameter-set">
  <div class="card">
    <div class="card-header">{{parameterSet.name}}</div>
    <div class="card-body">
       <span v-for="paramName in paramNames" class="badge badge-light me-2 mb-2 parameter" :style="getStyle(paramName)">
        {{paramName}}: <span style="font-weight:lighter;">{{parameterSet.parameterValues[paramName]}}</span>
       </span>
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { useStore } from "vuex";
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
        const store = useStore();
        const paramNames = computed(() => Object.keys(props.parameterSet.parameterValues));
        const currentParams = computed(() => store.state.run.parameterValues);
        const getStyle = (name: string) => {
            const isSameValueAsCurrent = props.parameterSet.parameterValues[name] === currentParams.value[name];
            const color = isSameValueAsCurrent ? "#bbb" : "#479fb6";
            return {
                color,
                border: `1px solid ${color}`
            };
        };

        return {
            paramNames,
            getStyle
        };
    }
});
</script>

<style scoped lang="scss">
.parameter-set {
  .parameter {
    font-size: medium;
  }
}
</style>