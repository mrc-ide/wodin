<template>
  <div id="edit-param">
    <div v-if="open" class="modal-backdrop fade show"></div>
    <div class="modal" :class="{show: open}" :style="style">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Vary Parameters</h5>
          </div>
          <div class="modal-body" style="min-height:26rem;">
            <template v-for="(settings, idx) in settingsInternal" :key="settings">
              <div class="clearfix mb-2">
                <vue-feather v-if="idx > 0"
                             class="inline-icon clickable float-end"
                             type="trash-2"
                             @click="() => removeSettings(idx)"
                             v-tooltip="`Remove ${settings.parameterToVary}`"></vue-feather>
              </div>
              <edit-param-settings :settings="settings"
                                   @update="(s) => updateSettings(idx, s)"
                                   @batchParsErrorChange="(e) => batchParsErrorChange(idx, e)"></edit-param-settings>
              <hr/>
            </template>
            <div class="text-center">
              <button class="btn btn-outline"
                           @click="addSettings"
                           v-tooltip="'Add parameter'">Add</button>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary"
                    :disabled="hasErrors"
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
import {
    computed, defineComponent, ref, watch
} from "vue";
import EditParamSettings from "./EditParamSettings.vue";
import { useStore } from "vuex";
import { SensitivityParameterSettings } from "../../store/sensitivity/state";
import { WodinError } from "../../types/responseTypes";
import { defaultSensitivityParamSettings } from "../../store/sensitivity/sensitivity";
import { MultiSensitivityMutation } from "../../store/multiSensitivity/mutations";
import VueFeather from "vue-feather";

export default defineComponent({
    name: "MultiSensitivityParamSettingsModal",
    props: {
        open: {
            type: Boolean,
            required: true
        }
    },
    components: {
      VueFeather,
        EditParamSettings
    },
    setup(props, { emit }) {
        const store = useStore();
        const settingsInternal = ref([] as SensitivityParameterSettings[]);
        const batchParsErrors = ref([] as (WodinError | null)[]);

        const style = computed(() => {
            return { display: props.open ? "block" : "none" };
        });

        // TODO: validation - do not allow save if same parameter specified more than once
        const hasErrors = computed(() => !!batchParsErrors.value.filter((e) => !!e).length);

        watch(() => props.open, (newValue) => {
            if (newValue) {
                settingsInternal.value = [...store.state.multiSensitivity.paramSettings ];
            }
        });

        const updateSettings = (index: number, newSettings: SensitivityParameterSettings) => {
            settingsInternal.value[index] = newSettings;
        };

        const addSettings = () => {
            // Add settings for the first parameter which is not already in the list
            const used = settingsInternal.value.map((p) => p.parameterToVary);
            const unused = Object.keys(store.state.run.parameterValues).filter((p) => !used.includes(p));
            if (unused.length) {
                settingsInternal.value.push({ ...defaultSensitivityParamSettings(), parameterToVary: unused[0] });
                batchParsErrors.value.push(null);
            }
            // TODO: show message if cannot add any more parameters
        };

        const removeSettings = (index: number) => {
            settingsInternal.value.splice(index, 1);
            batchParsErrors.value.splice(index, 1);
        };

        const batchParsErrorChange = (index: number, newError: WodinError | null) => {
            batchParsErrors.value[index] = newError;
        };

        const close = () => {
            emit("close");
        };
        const saveSettings = () => {
            store.commit(`multiSensitivity/${MultiSensitivityMutation.SetParamSettings}`, [...settingsInternal.value]);
            close();
        };

        return {
            style,
            settingsInternal,
            updateSettings,
            hasErrors,
            batchParsErrorChange,
            addSettings,
            removeSettings,
            saveSettings,
            close
        };
    }
});
</script>
