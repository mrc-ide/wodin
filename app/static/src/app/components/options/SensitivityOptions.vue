<template>
  <vertical-collapse :title="title" collapse-id="sensitivity-options">
    <template v-if="showOptions">
      <div class="mt-2 clearfix">
        <div v-for="(settings, idx) in allSettings" :key="idx" class="sensitivity-options-settings">
          <div class="mb-2">
            <vue-feather v-if="canDeleteSettings"
                         class="inline-icon clickable float-end delete-param-settings ms-2"
                         type="trash-2"
                         @click="() => deleteSettings(idx)"
                         v-tooltip="`Remove ${settings.parameterToVary} Settings`"></vue-feather>
            <vue-feather class="inline-icon clickable float-end edit-param-settings"
                         type="edit"
                         @click="() => openEdit(idx)"
                         v-tooltip="`Edit ${settings.parameterToVary} Settings`"></vue-feather>
          </div>
          <ul>
            <li><strong>Parameter:</strong> {{settings.parameterToVary}}</li>
            <li><strong>Variation Type:</strong> {{ settings.variationType }}</li>
            <li v-if="settings.variationType !== 'Custom'"><strong>Scale Type:</strong> {{ settings.scaleType }}</li>
            <li v-if="settings.variationType === 'Percentage'">
              <strong>Variation (%):</strong> {{ settings.variationPercentage }}
            </li>
            <template v-if="settings.variationType === 'Range'">
              <li><strong>From:</strong> {{ settings.rangeFrom }}</li>
              <li><strong>To:</strong> {{ settings.rangeTo }}</li>
            </template>
            <li v-if="settings.variationType === 'Custom'">
              <strong>Values:</strong>
              {{ settings.customValues.join(", ") }}
            </li>
            <li v-if="settings.variationType !== 'Custom'">
              <strong>Number of runs:</strong> {{ settings.numberOfRuns}}
            </li>
          </ul>
          <sensitivity-param-values v-if="settings.variationType !== 'Custom'"
                                    :batch-pars="batchPars"
                                    :param-name="settings.parameterToVary">
          </sensitivity-param-values>
          <hr v-if="idx < allSettings.length-1" />
        </div>
        <div v-if="multiSensitivity" class="text-center">
          <button class="btn btn-outline add-param-settings"
                  v-if="paramsWithoutSettings.length"
                  id="add-param-settings"
                  @click="addSettings"
                  v-tooltip="'Add parameter settings'">Add</button>
        </div>
      </div>
      <hr/>
      <sensitivity-plot-options></sensitivity-plot-options>
    </template>
    <div v-else id="sensitivity-options-msg">
      {{compileModelMessage}}
    </div>
  </vertical-collapse>
  <edit-param-settings :open="editOpen"
                       :param-settings="settingsToEdit"
                       @close="closeEdit"
                       @update="editSettings"></edit-param-settings>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { computed, defineComponent, ref } from "vue";
import VueFeather from "vue-feather";
import { AppState } from "../../store/appState/state";
import { defaultSensitivityParamSettings } from "../../store/sensitivity/sensitivity";
import { MultiSensitivityGetter } from "../../store/multiSensitivity/getters";
import userMessages from "../../userMessages";
import VerticalCollapse from "../VerticalCollapse.vue";
import EditParamSettings from "./EditParamSettings.vue";
import { SensitivityGetter } from "../../store/sensitivity/getters";
import SensitivityParamValues from "./SensitivityParamValues.vue";
import SensitivityPlotOptions from "./SensitivityPlotOptions.vue";
import { SensitivityParameterSettings } from "../../store/sensitivity/state";
import { SensitivityMutation } from "../../store/sensitivity/mutations";
import { MultiSensitivityMutation } from "../../store/multiSensitivity/mutations";

export default defineComponent({
    name: "SensitivityOptions",
    props: {
        multiSensitivity: {
            type: Boolean,
            required: true
        }
    },
    components: {
        VueFeather,
        SensitivityParamValues,
        SensitivityPlotOptions,
        VerticalCollapse,
        EditParamSettings
    },
    setup(props) {
        const store = useStore<AppState>();
        const addingParamSettings = ref(false);

        const multiSensitivitySettings = computed(() => store.state.multiSensitivity.paramSettings);

        const allSettings = computed(() => (props.multiSensitivity ? multiSensitivitySettings.value
            : [store.state.sensitivity.paramSettings]));

        const showOptions = computed(() => allSettings.value.length && !!allSettings.value[0].parameterToVary);
        const compileModelMessage = userMessages.sensitivity.compileRequiredForOptions(props.multiSensitivity);
        const editOpen = ref(false);
        const editSettingsIdx = ref<number | null>(0);

        const title = computed(() => (`${props.multiSensitivity ? "Multi-sensitivity" : "Sensitivity"} Options`));

        const paramsWithoutSettings = computed(() => {
            const used = multiSensitivitySettings.value.map((p) => p.parameterToVary);
            return Object.keys(store.state.run.parameterValues!).filter((p) => !used.includes(p));
        });

        const defaultNewSettings = computed(() => {
            const unused = paramsWithoutSettings.value;
            return { ...defaultSensitivityParamSettings(), parameterToVary: unused[0] };
        });

        const settingsToEdit = computed(() => {
            if (addingParamSettings.value) {
                return defaultNewSettings.value;
            }
            return editSettingsIdx.value === null ? null : allSettings.value[editSettingsIdx.value];
        });

        const openEdit = (settingsIdx: number) => {
            editSettingsIdx.value = settingsIdx;
            editOpen.value = true;
        };

        const closeEdit = () => {
            editSettingsIdx.value = null;
            addingParamSettings.value = false;
            editOpen.value = false;
        };

        const updateMultiSensitivitySettings = (newSettings: SensitivityParameterSettings[]) => {
            store.commit(`multiSensitivity/${MultiSensitivityMutation.SetParamSettings}`, newSettings);
        };
        const editSettings = (settings: SensitivityParameterSettings) => {
            if (!props.multiSensitivity) {
                store.commit(`sensitivity/${SensitivityMutation.SetParamSettings}`, settings);
            } else {
                const newSettings = [...multiSensitivitySettings.value];
                if (addingParamSettings.value) {
                    newSettings.push(settings);
                } else {
                    newSettings[editSettingsIdx.value!] = settings;
                }
                updateMultiSensitivitySettings(newSettings);
            }
        };

        const canDeleteSettings = computed(() => props.multiSensitivity && multiSensitivitySettings.value.length > 1);

        const addSettings = () => {
            addingParamSettings.value = true;
            editOpen.value = true;
        };

        const deleteSettings = (idx: number) => {
            const newSettings = [...multiSensitivitySettings.value];
            newSettings.splice(idx, 1);
            updateMultiSensitivitySettings(newSettings);
        };

        const batchPars = computed(() => (props.multiSensitivity
            ? store.getters[`multiSensitivity/${MultiSensitivityGetter.batchPars}`]
            : store.getters[`sensitivity/${SensitivityGetter.batchPars}`]));

        return {
            title,
            allSettings,
            settingsToEdit,
            paramsWithoutSettings,
            canDeleteSettings,
            showOptions,
            compileModelMessage,
            addingParamSettings,
            closeEdit,
            openEdit,
            editSettings,
            addSettings,
            deleteSettings,
            editOpen,
            batchPars
        };
    }
});
</script>
