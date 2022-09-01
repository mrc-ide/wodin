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
import { RunMutation } from "../../store/run/mutations";
import NumericInput from "./NumericInput.vue";
import { Dict } from "../../types/utilTypes";
import { AppType, VisualisationTab } from "../../store/appState/state";
import { ModelFitMutation } from "../../store/modelFit/mutations";
import userMessages from "../../userMessages";
import { SensitivityMutation } from "../../store/sensitivity/mutations";

export default defineComponent({
    name: "ParameterValues",
    components: {
        NumericInput
    },
    setup() {
        const store = useStore();

        const paramsToVary = computed<string[]>(() => {
            return store.state.appType === AppType.Fit ? store.state.modelFit.paramsToVary : [];
        });

        const paramValues = computed(() => store.state.run.parameterValues);
        const paramNames = computed(
            () => (paramValues.value ? Object.keys(paramValues.value) : [])
        );

        const paramVaryFlags = computed(() => {
            return paramNames.value.reduce((values: Dict<boolean>, key: string) => {
            // eslint-disable-next-line no-param-reassign
                values[key] = paramsToVary.value.includes(key);
                return values;
            }, {} as Dict<boolean>);
        });

        const timestampParamNames = () => paramNames.value.map((name: string) => name + Date.now());

        const paramKeys = ref(timestampParamNames());
        const odinSolution = computed(() => store.state.run.result?.solution);

        const updateValue = (newValue: number, paramName: string) => {
            store.commit(`run/${RunMutation.UpdateParameterValues}`, { [paramName]: newValue });
            store.commit(`modelFit/${ModelFitMutation.SetFitUpdateRequired}`, { parameterValueChanged: true });
            store.commit(`sensitivity/${SensitivityMutation.SetUpdateRequired}`, true);
        };

        const checkBoxChange = (paramName: string, event: Event) => {
            const { checked } = event.target as HTMLInputElement;
            const currentParams = paramsToVary.value;
            const newParams = checked ? [...currentParams, paramName] : currentParams.filter((p) => p !== paramName);
            store.commit(`modelFit/${ModelFitMutation.SetParamsToVary}`, newParams);
            store.commit(`modelFit/${ModelFitMutation.SetFitUpdateRequired}`, { parameterToVaryChanged: true });
        };

        const fitTabIsOpen = computed(() => store.state.openVisualisationTab === VisualisationTab.Fit);

        const selectParamToVaryMsg = computed(() => {
            return (!fitTabIsOpen.value || paramsToVary.value.length) ? "" : userMessages.modelFit.selectParamToVary;
        });

        watch(odinSolution, () => {
            // force inputs to update when model is run to show actual values
            paramKeys.value = timestampParamNames();
        });

        return {
            fitTabIsOpen,
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
<style scoped lang="scss">
 .vary-param-msg {
   min-height: 1.4rem;
 }
</style>
