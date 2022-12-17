<template>
<div class="container parameter-set">
  <div class="card">
    <div class="card-header">{{parameterSet.name}}</div>
    <div class="card-body">
       <span v-for="(value, name) in parameterSet.parameterValues" class="badge badge-light me-2 mb-2 parameter" :style="getStyle(name)">
        {{name}}: <span style="font-weight:lighter;">{{value}}</span>
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
    name: "ParameterSetView",
    props: {
        parameterSet: {
            type: Object as PropType<ParameterSet>,
            required: true
        }
    },
    setup(props) {
        const store = useStore();
        const currentParams = computed(() => store.state.run.parameterValues);
        const getStyle = (name: string) => {
            const diffFromCurrent = props.parameterSet.parameterValues[name] - currentParams.value[name];
            // Show values > current in green, < current in red, == current in grey
            const color = diffFromCurrent === 0 ? "#bbb" : diffFromCurrent > 0 ? "#28a745" : "#dc3545";
            return {
                color,
                border: `1px solid ${color}`
            };
        };

        return {
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