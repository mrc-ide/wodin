<template>
  <vertical-collapse :title="title" collapse-id="sensitivity-options">
    <template v-if="showOptions">
      <div class="mt-2 clearfix">
        <button class="btn btn-primary mb-4 float-end" @click="toggleEdit(true)">Edit</button>
        <div v-for="(settings, idx) in allSettings" :key="idx" class="sensitivity-options-settings">
          <ul>
            <li><strong>Parameter:</strong> {{settings.parameterToVary}}</li>
            <li><strong>Scale Type:</strong> {{ settings.scaleType }}</li>
            <li><strong>Variation Type:</strong> {{ settings.variationType }}</li>
            <li v-if="settings.variationType === 'Percentage'">
              <strong>Variation (%):</strong> {{ settings.variationPercentage }}
            </li>
            <template v-if="settings.variationType === 'Range'">
              <li><strong>From:</strong> {{ settings.rangeFrom }}</li>
              <li><strong>To:</strong> {{ settings.rangeTo }}</li>
            </template>
            <li> v-if="settings.variationType === 'User'"<strong>Values:</strong>
              {{ settings.userValues.join(", ") }}
            </li>
            <li v-if="settings.variationType !== 'User'">
              <strong>Number of runs:</strong> {{ settings.numberOfRuns}}
            </li>
          </ul>
          <sensitivity-param-values v-if="settings.variationType !== 'User'" :batch-pars="allBatchPars[idx]">
          </sensitivity-param-values>
          <hr v-if="idx < allSettings.length-1" />
        </div>
      </div>
      <hr/>
      <sensitivity-plot-options></sensitivity-plot-options>
    </template>
    <div v-else id="sensitivity-options-msg">
      {{compileModelMessage}}
    </div>
  </vertical-collapse>
  <multi-sensitivity-param-settings-modal v-if="multiSensitivity" :open="editOpen" @close="toggleEdit(false)">
  </multi-sensitivity-param-settings-modal>
  <sensitivity-param-settings-modal v-else :open="editOpen" @close="toggleEdit(false)">
  </sensitivity-param-settings-modal>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { computed, defineComponent, ref } from "vue";
import userMessages from "../../userMessages";
import VerticalCollapse from "../VerticalCollapse.vue";
import { SensitivityGetter } from "../../store/sensitivity/getters";
import SensitivityParamValues from "./SensitivityParamValues.vue";
import SensitivityPlotOptions from "./SensitivityPlotOptions.vue";
import SensitivityParamSettingsModal from "./SensitivityParamSettingsModal.vue";
import MultiSensitivityParamSettingsModal from "./MultiSensitivityParamSettingsModal.vue";
import { MultiSensitivityGetter } from "../../store/multiSensitivity/getters";

export default defineComponent({
    name: "SensitivityOptions",
    props: {
        multiSensitivity: {
            type: Boolean,
            required: true
        }
    },
    components: {
        MultiSensitivityParamSettingsModal,
        SensitivityParamValues,
        SensitivityPlotOptions,
        VerticalCollapse,
        SensitivityParamSettingsModal
    },
    setup(props) {
        const store = useStore();
        const allSettings = computed(() => (props.multiSensitivity ? store.state.multiSensitivity.paramSettings
            : [store.state.sensitivity.paramSettings]));

        const showOptions = computed(() => allSettings.value.length && !!allSettings.value[0].parameterToVary);
        const compileModelMessage = userMessages.sensitivity.compileRequiredForOptions;
        const editOpen = ref(false);

        const title = computed(() => (props.multiSensitivity ? "Multi-sensitivity Options" : "Sensitivity Options"));
        const toggleEdit = (value: boolean) => {
            editOpen.value = value;
        };

        const allBatchPars = computed(() => (props.multiSensitivity
            ? store.getters[`multiSensitivity/${MultiSensitivityGetter.multiBatchPars}`]
            : [store.getters[`sensitivity/${SensitivityGetter.batchPars}`]]));

        return {
            title,
            allSettings,
            showOptions,
            compileModelMessage,
            toggleEdit,
            editOpen,
            allBatchPars
        };
    }
});
</script>
