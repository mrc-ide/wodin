<template>
  <div>
    <div v-if="open" class="modal-backdrop fade show"></div>
    <div class="modal" :class="{show: open}" :style="style">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Vary Parameter</h5>
          </div>
          <div class="modal-body">
            <div class="row" id="edit-param-to-vary">
               <div class="col-5">
                 <label class="col-form-label">Parameter to vary</label>
               </div>
               <div class="col-6">
                 <select class="form-select" v-model="settingsInternal.parameterToVary">
                   <option v-for="param in paramNames" :key="param">{{param}}</option>
                 </select>
               </div>
             </div>
             <div class="row mt-2" id="edit-scale-type">
               <div class="col-5">
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
              <div class="col-5">
                <label class="col-form-label">Variation type</label>
              </div>
              <div class="col-6">
                <select class="form-select" v-model="settingsInternal.variationType">
                  <option v-for="variation in variationTypeValues" :key="variation">{{variation}}</option>
                </select>
              </div>
            </div>
            <div v-if="settingsInternal.variationType === 'Percentage'" class="row mt-2" id="edit-percent">
              <div class="col-5">
                <label class="col-form-label">Variation (%)</label>
              </div>
              <div class="col-6">
                <numeric-input :value="settingsInternal.variationPercentage"
                               @update="(n) => settingsInternal.variationPercentage = n"></numeric-input>
              </div>
            </div>
            <template v-else>
              <div class="row mt-2" id="edit-from">
                <div class="col-5">
                  <label class="col-form-label">From</label>
                </div>
                <div class="col-6">
                  <numeric-input :value="settingsInternal.rangeFrom"
                                 @update="(n) => settingsInternal.rangeFrom = n"></numeric-input>
                </div>
              </div>
              <div class="row mt-2" id="edit-to">
                <div class="col-5">
                  <label class="col-form-label">To</label>
                </div>
                <div class="col-6">
                  <numeric-input :value="settingsInternal.rangeTo"
                                 @update="(n) => settingsInternal.rangeTo = n"></numeric-input>
                </div>
              </div>
            </template>
            <div class="row mt-2" id="edit-runs">
              <div class="col-5">
                <label class="col-form-label">Number of runs</label>
              </div>
              <div class="col-6">
                <numeric-input :value="settingsInternal.numberOfRuns"
                               @update="(n) => settingsInternal.numberOfRuns = n"></numeric-input>
              </div>
            </div>
            <div v-if="!valid" class="row mt-2 small text-danger" id="invalid-msg">
              <div class="col-12">
                {{invalidMessage}}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary"
                    :disabled="valid ? undefined : 'disabled'"
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
import userMessages from "../../userMessages";

export default defineComponent({
    name: "EditParamSettings.vue",
    props: {
        open: {
            type: Boolean,
            required: true
        }
    },
    components: {
        NumericInput
    },
    setup(props, { emit }) {
        const store = useStore();
        const settingsInternal = reactive({} as SensitivityParameterSettings);

        const paramNames = computed(() => {
            return store.state.model.parameterValues ? Array.from(store.state.model.parameterValues.keys()) : [];
        });

        const scaleValues = Object.keys(SensitivityScaleType);
        const variationTypeValues = Object.keys(SensitivityVariationType);

        const valid = computed(() => {
            return settingsInternal.variationType === SensitivityVariationType.Percentage
                    || settingsInternal.rangeFrom! < settingsInternal.rangeTo!;
        });
        const invalidMessage = userMessages.sensitivity.varyParamsInvalid;

        const style = computed(() => {
            return { display: props.open ? "block" : "none" };
        });

        watch(() => props.open, (newValue) => {
            if (newValue) {
                Object.assign(settingsInternal, { ...store.state.sensitivity.paramSettings });
            }
        });

        const close = () => { emit("close"); };
        const updateSettings = () => {
            store.commit(`sensitivity/${SensitivityMutation.SetParamSettings}`, { ...settingsInternal });
            close();
        };

        return {
            valid,
            paramNames,
            scaleValues,
            variationTypeValues,
            settingsInternal,
            style,
            invalidMessage,
            close,
            updateSettings
        };
    }
});
</script>
