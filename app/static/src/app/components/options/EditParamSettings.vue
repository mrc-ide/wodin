<template>
    <div class="row edit-param-to-vary">
       <div class="col-6">
         <label class="col-form-label">Parameter to vary</label>
       </div>
       <div class="col-6">
         <select class="form-select" v-model="settingsInternal.parameterToVary">
           <option v-for="param in paramNames" :key="param">{{param}}</option>
         </select>
       </div>
     </div>
    <div class="row mt-2 edit-scale-type">
       <div class="col-6">
         <label class="col-form-label">Scale type</label>
       </div>
       <div class="col-6">
         <select class="form-select" v-model="settingsInternal.scaleType">
           <option v-for="scale in scaleValues" :key="scale">{{scale}}</option>
         </select>
       </div>
       <div class="col-6">
     </div>
     </div>
    <div class="row mt-2 edit-variation-type">
      <div class="col-6">
        <label class="col-form-label">Variation type</label>
      </div>
      <div class="col-6">
        <select class="form-select" v-model="settingsInternal.variationType">
          <option v-for="variation in variationTypeValues" :key="variation">{{variation}}</option>
        </select>
      </div>
    </div>
    <div v-if="settingsInternal.variationType === 'Percentage'" class="row mt-2 edit-percent">
      <div class="col-6">
        <label class="col-form-label">Variation (%)</label>
      </div>
      <div class="col-6">
        <numeric-input :value="settingsInternal.variationPercentage"
                       @update="(n) => settingsInternal.variationPercentage = n"></numeric-input>
      </div>
    </div>
    <template v-else>
      <div class="row mt-2 edit-from">
        <div class="col-6">
          <label class="col-form-label">From</label>
        </div>
        <div class="col-6">
          <numeric-input :value="settingsInternal.rangeFrom"
                         @update="(n) => settingsInternal.rangeFrom = n"></numeric-input>
        </div>
      </div>
      <div class="row mt-2 text-muted param-central">
        <div class="col-6">
          Central value
        </div>
        <div class="col-6 param-central-value">
          {{ centralValue }}
        </div>
      </div>
      <div class="row mt-2 edit-to">
        <div class="col-6">
          <label class="col-form-label">To</label>
        </div>
        <div class="col-6">
          <numeric-input :value="settingsInternal.rangeTo"
                         @update="(n) => settingsInternal.rangeTo = n"></numeric-input>
        </div>
      </div>
    </template>
    <div class="row mt-2 edit-runs">
      <div class="col-6">
        <label class="col-form-label">Number of runs</label>
      </div>
      <div class="col-6">
        <numeric-input :value="settingsInternal.numberOfRuns"
                       @update="(n) => settingsInternal.numberOfRuns = n"></numeric-input>
      </div>
    </div>
    <div v-if="batchParsError" class="row mt-2 small text-danger invalid-msg">
      <div class="col-12">
        <error-info :error="batchParsError"></error-info>
      </div>
    </div>
    <sensitivity-param-values :batch-pars="batchPars"></sensitivity-param-values>
</template>

<script lang="ts">
import {
    computed, defineComponent, PropType, reactive, watch
} from "vue";
import { useStore } from "vuex";
import {
    SensitivityParameterSettings,
    SensitivityScaleType,
    SensitivityVariationType
} from "../../store/sensitivity/state";
import NumericInput from "./NumericInput.vue";
import SensitivityParamValues from "./SensitivityParamValues.vue";
import { generateBatchPars } from "../../utils";
import ErrorInfo from "../ErrorInfo.vue";

export default defineComponent({
    name: "EditParamSettings",
    props: {
        settings: {
            type: Object as PropType<SensitivityParameterSettings>,
            required: true
        }
    },
    emits: ["update", "batchParsErrorChange"],
    components: {
        ErrorInfo,
        NumericInput,
        SensitivityParamValues
    },
    setup(props, { emit }) {
        const store = useStore();
        const settingsInternal = reactive({ ...props.settings });

        const paramNames = computed(() => {
            return store.state.run.parameterValues ? Object.keys(store.state.run.parameterValues) : [];
        });

        const scaleValues = Object.keys(SensitivityScaleType);
        const variationTypeValues = Object.keys(SensitivityVariationType);

        const centralValue = computed(() => store.state.run.parameterValues[settingsInternal.parameterToVary!]);

        const paramValues = computed(() => store.state.run.parameterValues);
        const batchParsResult = computed(() => generateBatchPars(store.state, settingsInternal, paramValues.value));
        const batchPars = computed(() => batchParsResult.value.batchPars);
        const batchParsError = computed(() => batchParsResult.value.error);

        watch(settingsInternal, (newVal) => emit("update", newVal));
        watch(batchParsError, (newVal) => emit("batchParsErrorChange", newVal));

        return {
            paramNames,
            scaleValues,
            variationTypeValues,
            settingsInternal,
            centralValue,
            batchPars,
            batchParsError
        };
    }
});
</script>
