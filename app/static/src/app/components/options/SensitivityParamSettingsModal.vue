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
            <edit-param-settings :settings="settingsInternal"
                                 @update="updateSettings"
                                 @batchParsErrorChange="batchParsErrorChange"></edit-param-settings>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary"
                    :disabled="!!batchParsError"
                    id="ok-settings"
                    @click="saveSettings">OK</button>
            <button class="btn btn-outline"
                    id="cancel-settings"
                    @click="close">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, defineComponent, reactive, ref, watch} from "vue";
import EditParamSettings from "@/app/components/options/EditParamSettings.vue";
import { useStore } from "vuex";
import {SensitivityParameterSettings} from "@/app/store/sensitivity/state";
import {SensitivityMutation} from "@/app/store/sensitivity/mutations";

export default defineComponent({
    name: "SensitivityParamSettingsModal",
    props: {
        open: {
            type: Boolean,
            required: true
        }
    },
    components: {
        EditParamSettings
    },
    setup(props, { emit }) {
        const store = useStore();
        const settingsInternal = ref({} as SensitivityParameterSettings);
        const batchParsError = ref(null as WodinError | null);

        const style = computed(() => {
          return { display: props.open ? "block" : "none" };
        });

        watch(() => props.open, (newValue) => {
          if (newValue) {
            Object.assign(settingsInternal, { ...store.state.sensitivity.paramSettings });
          }
        });

        const updateSettings = (newSettings) => {
          settingsInternal.value = newSettings;
        };

        const batchParsErrorChange = (newError) => {
          batchParsError.value = newError;
        };

        const close = () => { emit("close"); };
        const saveSettings = () => {
          store.commit(`sensitivity/${SensitivityMutation.SetParamSettings}`, { ...settingsInternal });
          close();
        };

        return {
          style,
          settingsInternal,
          updateSettings,
          batchParsErrorChange,
          saveSettings
        };
    }
});

</script>
