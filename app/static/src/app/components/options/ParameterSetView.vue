<template>
<div class="container parameter-set">
  <div class="card">
    <div class="card-header">
      {{parameterSet.name}}
      <span class="float-end">
        <vue-feather class="inline-icon clickable delete-param-set"
                     type="trash-2" @click="deleteParameterSet"
                     v-tooltip="'Delete Parameter Set'"></vue-feather>
      </span>
    </div>
    <div class="card-body">
       <span v-for="(value, name) in parameterSet.parameterValues"
             :key="name"
             class="badge badge-light me-2 mb-2 parameter"
             :style="getStyle(name)">
        {{name}}: <span style="font-weight:lighter;">{{value}}</span>
       </span>
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { useStore } from "vuex";
import VueFeather from "vue-feather";
import { ParameterSet } from "../../store/run/state";
import { RunAction } from "../../store/run/actions";

export default defineComponent({
    name: "ParameterSetView",
    props: {
        parameterSet: {
            type: Object as PropType<ParameterSet>,
            required: true
        }
    },
    components: {
        VueFeather
    },
    setup(props) {
        const store = useStore();
        const currentParams = computed(() => store.state.run.parameterValues);
        const getStyle = (name: string) => {
            const diffFromCurrent = props.parameterSet.parameterValues[name] - currentParams.value[name];
            // Show values > current in blue, < current in red, == current in grey
            let color = "#bbb";
            if (diffFromCurrent > 0) {
                color = "#479fb6";
            } else if (diffFromCurrent < 0) {
                color = "#dc3545";
            }
            return {
                color,
                border: `1px solid ${color}`
            };
        };

        const deleteParameterSet = () => {
            store.dispatch(`run/${RunAction.DeleteParameterSet}`, props.parameterSet.name);
        };

        return {
            getStyle,
            deleteParameterSet
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
