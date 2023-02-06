<template>
<div class="container parameter-set">
  <div class="card">
    <div class="card-header">
      {{parameterSet.name}}
      <div class="d-inline-block trace ms-2" :class="lineStyleClass"></div>
      <span class="float-end">
        <vue-feather class="inline-icon clickable hide-param-set"
                     v-if="!parameterSet.hidden"
                     type="eye-off"
                     @click="toggleHidden"
                     v-tooltip="'Hide Parameter Set'"></vue-feather>
        <vue-feather class="inline-icon clickable show-param-set"
                     v-if="parameterSet.hidden"
                     type="eye"
                     @click="toggleHidden"
                     v-tooltip="'Show Parameter Set'"></vue-feather>
        <vue-feather class="inline-icon clickable swap-param-set ms-2"
                     type="shuffle"
                     :disabled="!canSwapParameterSet"
                     :stroke="canSwapParameterSet ? 'black' : 'lightgray'"
                     :style="{ cursor: canSwapParameterSet ? 'pointer' : 'default' }"
                     @click="swapParameterSet"
                     v-tooltip="'Swap Parameter Set with Current Parameter Values'"></vue-feather>
        <vue-feather class="inline-icon clickable delete-param-set ms-2"
                     type="trash-2"
                     @click="deleteParameterSet"
                     v-tooltip="'Delete Parameter Set'"></vue-feather>
      </span>
    </div>
    <div class="card-body" :class="parameterSet.hidden ? 'hidden-parameter-set' : ''">
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
import { RunMutation } from "../../store/run/mutations";
import { paramSetLineStyle } from "../../plot";
import { RunGetter } from "../../store/run/getters";

export default defineComponent({
    name: "ParameterSetView",
    props: {
        index: {
            type: Number,
            required: true
        },
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

        const lineStyleClass = computed(() => `trace-${paramSetLineStyle(props.index)}`);

        const deleteParameterSet = () => {
            store.dispatch(`run/${RunAction.DeleteParameterSet}`, props.parameterSet.name);
        };

        const swapParameterSet = () => {
            store.dispatch(`run/${RunAction.SwapParameterSet}`, props.parameterSet.name);
        };

        const toggleHidden = () => {
            store.commit(`run/${RunMutation.ToggleParameterSetHidden}`, props.parameterSet.name);
        };

        const runRequired = computed(() => store.getters[`run/${RunGetter.runIsRequired}`]);
        const canSwapParameterSet = computed(() => {
            return !(store.state.model.compileRequired || runRequired.value);
        });

        return {
            lineStyleClass,
            getStyle,
            deleteParameterSet,
            swapParameterSet,
            toggleHidden,
            canSwapParameterSet
        };
    }
});
</script>

<style scoped lang="scss">
.parameter-set {

  $trace-color: #333;

  .trace {
    border-top: $trace-color;
    border-top-width: 2px;
    width: 6rem;
    height: 0.5rem;
    background-position: left top;
    background-repeat: repeat-x;
  }

  .trace-dot {
    border-top-style: dotted;
  }

  .trace-dash {
    background-image: linear-gradient(to right, $trace-color 50%, transparent 50%);
    background-size: 10px 2px;
  }

  .trace-longdash {
    background-image: linear-gradient(to right, $trace-color 50%, transparent 50%);
    background-size: 20px 2px;
  }

  .trace-dashdot {
    background-image: linear-gradient(
            to right,
            $trace-color 10%,
            transparent 10% 30%,
            $trace-color 30% 80%,
            transparent 80%);
    background-size: 16px 2px;
  }

  .trace-longdashdot {
    background-image: linear-gradient(
            to right,
            $trace-color 8%,
            transparent 8% 30%,
            $trace-color 30% 78%,
            transparent 78%);
    background-size: 24px 2px;
  }

  .parameter {
    font-size: medium;
  }
}
</style>
