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
            <div class="row">
               <div class="col-5">
                 <label class="col-form-label">Parameter to vary</label>
               </div>
               <div class="col-6">
                 <select class="form-select" v-model="settingsInternal.parameterToVary">
                   <option v-for="param in paramNames" :key="param">{{param}}</option>
                 </select>
               </div>
             </div>
             <div class="row mt-2">
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
            <div class="row mt-2">
              <div class="col-5">
                <label class="col-form-label">Variation type</label>
              </div>
              <div class="col-6">
                <select class="form-select" v-model="settingsInternal.variationType">
                  <option v-for="variation in variationTypeValues" :key="variation">{{variation}}</option>
                </select>
              </div>
            </div>
            <div v-if="settingsInternal.variationType === 'Percentage'" class="row mt-2">
              <div class="col-5">
                <label class="col-form-label">Variation (%)</label>
              </div>
              <div class="col-6">
                <numeric-input :value="settingsInternal.variationPercentage"
                               @update="(n) => update(n)"></numeric-input>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary"
                    :disabled="!valid"
                    @click="updateSettings">OK</button>
            <button class="btn btn-outline"
                    @click="close">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lan="ts">
import {
    defineComponent, computed, reactive, watch
} from "vue";
import { useStore } from "vuex";
import { SensitivityMutation } from "@/app/store/sensitivity/mutations";
import {SensitivityScaleType, SensitivityVariationType} from "@/app/store/sensitivity/state";
import NumericInput from "./NumericInput.vue";

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
        const settingsInternal = reactive({});

        const paramNames = computed(() => {
            return store.state.model.parameterValues ? Array.from(store.state.model.parameterValues.keys()) : [];
        });

        const scaleValues = Object.keys(SensitivityScaleType);
        const variationTypeValues = Object.keys(SensitivityVariationType);

        // TODO: do this properly
        const valid = computed(() => true);
        const style = computed(() => {
            return { display: props.open ? "block" : "none" };
        });

        const update = (n) => {
          console.log("doing update with " + n)
          settingsInternal.variationPercentage = n;
        };

        watch(() => props.open, (newValue) => {
            if (newValue) {
                console.log(JSON.stringify(store.state.sensitivity.paramSettings));
                Object.assign(settingsInternal, { ...store.state.sensitivity.paramSettings });
                console.log(settingsInternal.value);
            }
        });

        const close = () => { emit("close"); };
        const updateSettings = () => {
            store.commit(`sensitivity/${SensitivityMutation.SetSettings}`, { ...settingsInternal });
            close();
        };

        return {
            valid,
            paramNames,
            scaleValues,
            variationTypeValues,
            settingsInternal,
            style,
            close,
            update,
            updateSettings
        };
    }
});
</script>
