<template>
  <div class="container">
    <div v-for="(paramName, index) in paramNames" class="row my-2" :key="paramKeys[index]">
      <div class="col-5">
        <label class="col-form-label">{{paramName}}</label>
      </div>
      <div class="col-6">
        <numeric-input :value="paramValues[paramName]"
                       @update="(n) => updateValue(n, paramName)"/>
      </div>
      <div v-if="fitTabIsOpen" class="col-1">
        <input class="form-check-input align-bottom vary-param-check"
               type="checkbox"
               :checked="paramVaryFlags[paramName] ? 'checked' : undefined"
               value="paramName"
               @change="checkBoxChange(paramName, $event)"
        >
      </div>
    </div>
    <div id="select-param-msg" class="text-danger small vary-param-msg">
      {{ selectParamToVaryMsg }}
    </div>
  </div>
</template>

<script lang="ts">
import {
    defineComponent, computed, watch, ref
} from "vue";
import { useStore } from "vuex";
import { ModelMutation } from "../../store/model/mutations";
import NumericInput from "./NumericInput.vue";
import { Dict } from "../../types/utilTypes";
import { AppType } from "../../store/appState/state";
import { ModelFitMutation } from "../../store/modelFit/mutations";
import userMessages from "../../userMessages";

export default defineComponent({
    name: "ParameterValues",
    props: {
        fitTabIsOpen: {
            type: Boolean,
            required: true
        }
    },
    components: {
        NumericInput
    },
    setup(props) {
        const store = useStore();
        const paramValuesMap = computed(() => store.state.model.parameterValues);
        const paramNames = computed(
            () => (paramValuesMap.value ? Array.from(paramValuesMap.value.keys()) as string[] : [])
        );

        const paramsToVary = computed<string[]>(() => {
            return store.state.appType === AppType.Fit ? store.state.modelFit.paramsToVary : [];
        });

        const paramValues = computed(() => {
            return paramNames.value.reduce((values: Dict<number>, key: string) => {
                // eslint-disable-next-line no-param-reassign
                values[key] = paramValuesMap.value.get(key)!;
                return values;
            }, {} as Dict<number>);
        });

        const paramVaryFlags = computed(() => {
            return paramNames.value.reduce((values: Dict<boolean>, key: string) => {
            // eslint-disable-next-line no-param-reassign
                values[key] = paramsToVary.value.includes(key);
                return values;
            }, {} as Dict<boolean>);
        });

        const timestampParamNames = () => paramNames.value.map((name: string) => name + Date.now());

        const paramKeys = ref(timestampParamNames());
        const odinSolution = computed(() => store.state.model.odinSolution);

        const updateValue = (newValue: number, paramName: string) => {
            store.commit(`model/${ModelMutation.UpdateParameterValues}`, { [paramName]: newValue });
        };

        const checkBoxChange = (paramName: string, event: Event) => {
            const { checked } = event.target as HTMLInputElement;
            const currentParams = paramsToVary.value;
            const newParams = checked ? [...currentParams, paramName] : currentParams.filter((p) => p !== paramName);
            store.commit(`modelFit/${ModelFitMutation.SetParamsToVary}`, newParams);
        };

        const selectParamToVaryMsg = computed(() => {
            return (!props.fitTabIsOpen || paramsToVary.value.length) ? "" : userMessages.modelFit.selectParamToVary;
        });

        watch(odinSolution, () => {
            // force inputs to update when model is run to show actual values
            paramKeys.value = timestampParamNames();
        });

        return {
            paramValues,
            paramNames,
            paramKeys,
            paramsToVary,
            paramVaryFlags,
            selectParamToVaryMsg,
            updateValue,
            checkBoxChange
        };
    }
});
</script>
<style scope lang="scss">
 .vary-param-msg {
   min-height: 1.4rem;
 }
</style>
