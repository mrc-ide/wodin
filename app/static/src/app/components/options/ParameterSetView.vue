<template>
  <div class="container parameter-set">
    <div class="card">
      <div class="card-header param-card-header">
        <div
          v-show="!editDisplayName"
          class="ms-2 align-center"
          @click="editDisplayNameOn"
          style="word-wrap: break-word"
        >
          {{ parameterSet.displayName }}
        </div>
        <span v-show="editDisplayName" class="edit-mode-span">
          <input
            class="d-inline form-control param-name-input"
            ref="paramNameInput"
            v-model="newDisplayName"
            @keydown.enter="saveDisplayName"
            @blur="cancelEditDisplayName"
            v-tooltip="{
              content: parameterSet.displayNameErrorMsg,
              trigger: 'manual',
              variant: 'error',
            }"
          />
        </span>
        <span class="param-set-icons">
          <vue-feather
            class="inline-icon clickable edit-display-name param-set-icon"
            v-if="!editDisplayName"
            type="edit"
            @click="editDisplayNameOn"
            v-tooltip="'Rename Parameter Set'"
          ></vue-feather>
          <vue-feather
            class="inline-icon clickable save-display-name param-set-icon"
            v-else
            type="save"
            ref="saveButton"
            tabindex="-1"
            @click="saveDisplayName"
            v-tooltip="'Save Parameter Set Name'"
          ></vue-feather>
          <vue-feather
            class="inline-icon clickable hide-param-set ms-2 param-set-icon"
            v-if="!parameterSet.hidden && !editDisplayName"
            type="eye-off"
            @click="toggleHidden"
            v-tooltip="'Hide Parameter Set'"
          ></vue-feather>
          <vue-feather
            class="inline-icon clickable show-param-set ms-2 param-set-icon"
            v-if="parameterSet.hidden && !editDisplayName"
            type="eye"
            @click="toggleHidden"
            v-tooltip="'Show Parameter Set'"
          ></vue-feather>
          <vue-feather
            class="inline-icon clickable swap-param-set ms-2 param-set-icon"
            type="shuffle"
            v-if="!editDisplayName"
            :disabled="!canSwapParameterSet"
            :stroke="canSwapParameterSet ? 'black' : 'lightgray'"
            :style="{ cursor: canSwapParameterSet ? 'pointer' : 'default' }"
            @click="swapParameterSet"
            v-tooltip="'Swap Parameter Set with Current Parameter Values'"
          ></vue-feather>
          <vue-feather
            class="inline-icon clickable delete-param-set ms-2 param-set-icon"
            type="trash-2"
            v-if="!editDisplayName"
            @click="deleteParameterSet"
            v-tooltip="'Delete Parameter Set'"
          ></vue-feather>
        </span>
      </div>
      <div
        class="card-body"
        :class="parameterSet.hidden ? 'hidden-parameter-set' : ''"
      >
        <span class="trace-label mb-3">
          <div class="me-3">Line Style</div>
          <div class="trace mt-2" :class="lineStyleClass"></div>
        </span>
        <span
          v-for="(value, name, index) in parametersToShow"
          :key="`${name}-${index}`"
          class="badge badge-light me-2 mb-2 parameter"
          :style="getStyle(`${name}`)"
        >
          {{ name }}: <span style="font-weight: lighter">{{ value }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
    computed,
    defineComponent,
    nextTick,
    onBeforeUnmount,
    PropType,
    ref,
    watch
} from "vue";
import { useStore } from "vuex";
import VueFeather from "vue-feather";
import { ParameterSet } from "../../store/run/state";
import { RunAction } from "../../store/run/actions";
import { RunMutation } from "../../store/run/mutations";
import { paramSetLineStyle } from "../../plot";
import { RunGetter } from "../../store/run/getters";

const parameterColors = {
    red: "#dc3545",
    blue: "#479fb6",
    grey: "#bbb"
};
        
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

        const parametersToShow = computed(() => (store.state.run.showUnchangedParameters
            ? props.parameterSet.parameterValues
            : Object.fromEntries(
                Object.entries(props.parameterSet.parameterValues).filter(
                    ([name, value]) => currentParams.value[name] && value !== currentParams.value[name]
                )
            )));

        const getStyle = (name: string) => {
            const diffFromCurrent = props.parameterSet.parameterValues[name] - currentParams.value[name];

            let color = parameterColors.grey;
            if (diffFromCurrent > 0) {
                color = parameterColors.blue;
            } else if (diffFromCurrent < 0) {
                color = parameterColors.red;
            }
            return {
                color,
                border: `1px solid ${color}`
            };
        };

        const lineStyleClass = computed(
            () => `trace-${paramSetLineStyle(props.index)}`
        );

        const deleteParameterSet = () => {
            store.dispatch(
                `run/${RunAction.DeleteParameterSet}`,
                props.parameterSet.name
            );
        };

        const swapParameterSet = () => {
            store.dispatch(
                `run/${RunAction.SwapParameterSet}`,
                props.parameterSet.name
            );
        };

        const toggleHidden = () => {
            store.commit(
                `run/${RunMutation.ToggleParameterSetHidden}`,
                props.parameterSet.name
            );
        };

        const paramNameInput = ref(null);
        const editDisplayName = ref(false);
        const newDisplayName = ref(props.parameterSet.displayName);
        const editDisplayNameOn = () => {
            editDisplayName.value = true;
            nextTick(() => {
                (paramNameInput.value! as HTMLInputElement).select();
            });
        };
        const saveDisplayName = () => {
            const payload = {
                parameterSetName: props.parameterSet.name,
                newDisplayName: newDisplayName.value
            };
            store.commit(`run/${RunMutation.SaveParameterDisplayName}`, payload);
            if (!props.parameterSet.displayNameErrorMsg) {
                editDisplayName.value = false;
            }
        };
        const saveButton = ref<HTMLButtonElement | null>(null);
        const cancelEditDisplayName = (event: FocusEvent) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (
                event.relatedTarget
        && event.relatedTarget === (saveButton.value as any).$el
            ) return;
            store.commit(
                `run/${RunMutation.TurnOffDisplayNameError}`,
                props.parameterSet.name
            );
            newDisplayName.value = props.parameterSet.displayName;
            editDisplayName.value = false;
        };

        const turnOffDisplayNameError = () => {
            if (props.parameterSet.displayNameErrorMsg) {
                store.commit(
                    `run/${RunMutation.TurnOffDisplayNameError}`,
                    props.parameterSet.name
                );
            }
        };

        watch(newDisplayName, turnOffDisplayNameError);

        const runRequired = computed(
            () => store.getters[`run/${RunGetter.runIsRequired}`]
        );
        const canSwapParameterSet = computed(() => {
            return !(store.state.model.compileRequired || runRequired.value);
        });

        onBeforeUnmount(turnOffDisplayNameError);

        return {
            lineStyleClass,
            getStyle,
            deleteParameterSet,
            swapParameterSet,
            toggleHidden,
            canSwapParameterSet,
            editDisplayName,
            editDisplayNameOn,
            newDisplayName,
            saveDisplayName,
            paramNameInput,
            turnOffDisplayNameError,
            cancelEditDisplayName,
            saveButton,
            parametersToShow
        };
    }
});
</script>

<style scoped lang="scss">
.parameter-set {
  $trace-color: #333;
  $parameterEqualColor: #bbb;
  $parameterGreaterThanColor: #479fb6;
  $parameterLessThanColor: #dc3545;

  .parameter-greaterThan {
    color: $parameterGreaterThanColor;
    border: 1px solid $parameterGreaterThanColor;
  }
  .trace-label {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }
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
    background-image: linear-gradient(
      to right,
      $trace-color 50%,
      transparent 50%
    );
    background-size: 10px 2px;
  }

  .trace-longdash {
    background-image: linear-gradient(
      to right,
      $trace-color 50%,
      transparent 50%
    );
    background-size: 20px 2px;
  }

  .trace-dashdot {
    background-image: linear-gradient(
      to right,
      $trace-color 10%,
      transparent 10% 30%,
      $trace-color 30% 80%,
      transparent 80%
    );
    background-size: 16px 2px;
  }

  .trace-longdashdot {
    background-image: linear-gradient(
      to right,
      $trace-color 8%,
      transparent 8% 30%,
      $trace-color 30% 78%,
      transparent 78%
    );
    background-size: 24px 2px;
  }

  .parameter {
    font-size: medium;
  }
}

.param-set-icon {
  margin-top: 8px;
  margin-bottom: 8px;
}

.param-set-icons {
  display: flex;
  flex-grow: 1;
  justify-content: end;
}

.param-card-header {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}

.param-name-input {
  width: 100%;
  height: 30px;
  padding-left: 7px;
  padding-top: 0;
  padding-bottom: 0;
}

.edit-mode-span {
  width: calc(100% - 2.5rem);
}
</style>
