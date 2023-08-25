<template>
  <vertical-collapse :title="title" collapse-id="sensitivity-options">
    <template v-if="showOptions">
      <div class="mt-2 clearfix">
        <button class="btn btn-primary mb-4 float-end" @click="toggleEdit(true)">Edit</button>
        <div v-for="(settings, idx) in allSettings" :key="idx" class="sensitivity-options-settings">
          <ul>
            <li><strong>Parameter:</strong> {{settings.parameterToVary}}</li>
            <li v-if="settings.variationType !== 'Custom'"><strong>Scale Type:</strong> {{ settings.scaleType }}</li>
            <li><strong>Variation Type:</strong> {{ settings.variationType }}</li>
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
          <sensitivity-param-values v-if="settings.variationType !== 'Custom'" :batch-pars="allBatchPars[idx]">
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
  <edit-param-settings :open="editOpen" @close="toggleEdit(false)"></edit-param-settings>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { computed, defineComponent, ref } from "vue";
import { MultiSensitivityGetter } from "../../store/multiSensitivity/getters";
import userMessages from "../../userMessages";
import VerticalCollapse from "../VerticalCollapse.vue";
import EditParamSettings from "./EditParamSettings.vue";
import { SensitivityGetter } from "../../store/sensitivity/getters";
import SensitivityParamValues from "./SensitivityParamValues.vue";
import SensitivityPlotOptions from "./SensitivityPlotOptions.vue";

export default defineComponent({
    name: "SensitivityOptions",
    props: {
        multiSensitivity: {
            type: Boolean,
            required: true
        }
    },
    components: {
        SensitivityParamValues,
        SensitivityPlotOptions,
        VerticalCollapse,
        EditParamSettings
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
