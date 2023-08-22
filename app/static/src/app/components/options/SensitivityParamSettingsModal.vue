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
            <edit-param-settings v-if="settingsInternal"
                                 :settings="settingsInternal"
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

<script lang="ts">
import { computed, defineComponent, ref, watch} from "vue";
import { useStore } from "vuex";
import EditParamSettings from "./EditParamSettings.vue";
import { SensitivityParameterSettings } from "../../store/sensitivity/state";
import { SensitivityMutation } from "../../store/sensitivity/mutations";
import { WodinError } from "../../types/responseTypes";

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
        const settingsInternal = ref(null as SensitivityParameterSettings | null);
        const batchParsError = ref(null as WodinError | null);

        const style = computed(() => {
          return { display: props.open ? "block" : "none" };
        });

        watch(() => props.open, (newValue) => {
          if (newValue) {
            settingsInternal.value = { ...store.state.sensitivity.paramSettings };
          }
        });

        const updateSettings = (newSettings: SensitivityParameterSettings) => {
          settingsInternal.value = newSettings;
        };

        const batchParsErrorChange = (newError: WodinError | null) => {
          batchParsError.value = newError;
        };

        const close = () => { emit("close"); };
        const saveSettings = () => {
          store.commit(`sensitivity/${SensitivityMutation.SetParamSettings}`, settingsInternal);
          close();
        };

        return {
          style,
          settingsInternal,
          updateSettings,
          batchParsError,
          batchParsErrorChange,
          saveSettings,
          close
        };
    }
});
</script>
