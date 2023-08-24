<template>
  <div id="edit-param">
    <div v-if="open" class="modal-backdrop fade show"></div>
    <div class="modal" :class="{show: open}" :style="style">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Vary Parameter</h5>
          </div>
          <div class="modal-body" style="min-height:26rem;">
            <div class="row" id="edit-param-to-vary">
               <div class="col-6">
                 <label class="col-form-label">Parameter to vary</label>
               </div>
               <div class="col-6">
                 <select class="form-select" v-model="settingsInternal.parameterToVary">
                   <option v-for="param in paramNames" :key="param">{{param}}</option>
                 </select>
               </div>
             </div>
             <div v-if="settingsInternal.variationType !== 'User'"  class="row mt-2" id="edit-scale-type">
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
            <div class="row mt-2" id="edit-variation-type">
              <div class="col-6">
                <label class="col-form-label">Variation type</label>
              </div>
              <div class="col-6">
                <select class="form-select" v-model="settingsInternal.variationType">
                  <option v-for="variation in variationTypeValues" :key="variation">{{variation}}</option>
                </select>
              </div>
            </div>
            <div v-if="settingsInternal.variationType === 'Percentage'" class="row mt-2" id="edit-percent">
              <div class="col-6">
                <label class="col-form-label">Variation (%)</label>
              </div>
              <div class="col-6">
                <numeric-input :value="settingsInternal.variationPercentage"
                               @update="(n) => settingsInternal.variationPercentage = n"></numeric-input>
              </div>
            </div>
            <template v-if="settingsInternal.variationType === 'Range'">
              <div class="row mt-2" id="edit-from">
                <div class="col-6">
                  <label class="col-form-label">From</label>
                </div>
                <div class="col-6">
                  <numeric-input :value="settingsInternal.rangeFrom"
                                 @update="(n) => settingsInternal.rangeFrom = n"></numeric-input>
                </div>
              </div>
              <div class="row mt-2 text-muted" id="param-central">
                <div class="col-6">
                  Central value
                </div>
                <div class="col-6">
                  {{ centralValue }}
                </div>
              </div>
              <div class="row mt-2" id="edit-to">
                <div class="col-6">
                  <label class="col-form-label">To</label>
                </div>
                <div class="col-6">
                  <numeric-input :value="settingsInternal.rangeTo"
                                 @update="(n) => settingsInternal.rangeTo = n"></numeric-input>
                </div>
              </div>
            </template>
            <template v-if="settingsInternal.variationType === 'User'">
              <div id="edit-values" class="row mt-2">
                <div class="col-6">
                  <label class="col-form-label">Values</label>
                </div>
                <div class="col-6">
                  <tag-input :tags="settingsInternal.userValues" :numeric-only="true" @update="updateUserValues">
                  </tag-input>
                </div>
              </div>
            </template>
            <div v-if="settingsInternal.variationType !== 'User'" class="row mt-2 edit-runs">
              <div class="col-6">
                <label class="col-form-label">Number of runs</label>
              </div>
              <div class="col-6">
                <numeric-input :value="settingsInternal.numberOfRuns"
                               @update="(n) => settingsInternal.numberOfRuns = n"></numeric-input>
              </div>
            </div>
            <div v-if="batchParsError" class="row mt-2 small text-danger" id="invalid-msg">
              <div class="col-12">
                <error-info :error="batchParsError"></error-info>
              </div>
            </div>
            <sensitivity-param-values v-if="settingsInternal.variationType !== 'User'" :batch-pars="batchPars">
            </sensitivity-param-values>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary"
                    :disabled="!!batchParsError"
                    id="ok-settings"
                    @click="updateSettings">OK</button>
            <button class="btn btn-outline"
                    id="cancel-settings"
                    @click="close">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, watch
} from "vue";
import { useStore } from "vuex";
import { SensitivityMutation } from "../../store/sensitivity/mutations";
import {
    SensitivityParameterSettings,
    SensitivityScaleType,
    SensitivityVariationType
} from "../../store/sensitivity/state";
import NumericInput from "./NumericInput.vue";
import SensitivityParamValues from "./SensitivityParamValues.vue";
import { generateBatchPars } from "../../utils";
import ErrorInfo from "../ErrorInfo.vue";
import TagInput from "./TagInput.vue";

export default defineComponent({
    name: "EditParamSettings.vue",
    props: {
        open: {
            type: Boolean,
            required: true
        }
    },
    components: {
        ErrorInfo,
        NumericInput,
        SensitivityParamValues,
        TagInput
    },
    setup(props, { emit }) {
        const store = useStore();
        const settingsInternal = reactive({} as SensitivityParameterSettings);

        const paramNames = computed(() => {
            return store.state.run.parameterValues ? Object.keys(store.state.run.parameterValues) : [];
        });

        const scaleValues = Object.keys(SensitivityScaleType);
        const variationTypeValues = Object.keys(SensitivityVariationType);

        const style = computed(() => {
            return { display: props.open ? "block" : "none" };
        });

        watch(() => props.open, (newValue) => {
            if (newValue) {
                Object.assign(settingsInternal, { ...store.state.sensitivity.paramSettings });
            }
        });

        const centralValue = computed(() => store.state.run.parameterValues[settingsInternal.parameterToVary!]);

        const paramValues = computed(() => store.state.run.parameterValues);
        const batchParsResult = computed(() => {
            if (settingsInternal.variationType === SensitivityVariationType.User) {
                return null;
            }
            return generateBatchPars(store.state, settingsInternal, paramValues.value);
        });
        const batchPars = computed(() => batchParsResult.value?.batchPars);
        const batchParsError = computed(() => {
            if (settingsInternal.variationType === SensitivityVariationType.User) {
                // Minimum of two user values
                return settingsInternal.userValues.length < 2
                    ? { error: "Invalid settings", detail: "Must include at least 2 traces in the batch" } : null;
            }
            return batchParsResult.value?.error;
        });
        const updateUserValues = (newValues: number[]) => {
            // sort and remove duplicates
            const cleaned = [...new Set(newValues)].sort((a, b) => a - b);
            settingsInternal.userValues = cleaned;
        };

        const close = () => { emit("close"); };
        const updateSettings = () => {
            store.commit(`sensitivity/${SensitivityMutation.SetParamSettings}`, { ...settingsInternal });
            close();
        };

        return {
            paramNames,
            scaleValues,
            variationTypeValues,
            settingsInternal,
            style,
            centralValue,
            batchPars,
            batchParsError,
            updateUserValues,
            close,
            updateSettings
        };
    }
});
</script>
