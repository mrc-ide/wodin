<template>
  <vertical-collapse title="Sensitivity Options" collapse-id="sensitivity-options">
    <template v-if="showOptions">
      <div class="mt-2 clearfix">
        <ul>
          <li><strong>Parameter:</strong> {{settings.parameterToVary}}</li>
          <li><strong>Scale Type:</strong> {{ settings.scaleType }}</li>
          <li><strong>Variation Type:</strong> {{ settings.variationType }}</li>
          <li v-if="settings.variationType === 'Percentage'">
            <strong>Variation (%):</strong> {{ settings.variationPercentage }}
          </li>
          <template v-else>
            <li><strong>From:</strong> {{ settings.rangeFrom }}</li>
            <li><strong>To:</strong> {{ settings.rangeTo }}</li>
          </template>
          <li><strong>Number of runs:</strong> {{ settings.numberOfRuns}}</li>
        </ul>
        <sensitivity-param-values :batch-pars="batchPars"></sensitivity-param-values>
        <button class="btn btn-primary mb-4 float-end" @click="toggleEdit(true)">Edit</button>
      </div>
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
import userMessages from "../../userMessages";
import VerticalCollapse from "../VerticalCollapse.vue";
import EditParamSettings from "./EditParamSettings.vue";
import { SensitivityGetter } from "../../store/sensitivity/getters";
import SensitivityParamValues from "./SensitivityParamValues.vue";

export default defineComponent({
    name: "SensitivityOptions",
    components: {
        SensitivityParamValues,
        VerticalCollapse,
        EditParamSettings
    },
    setup() {
        const store = useStore();
        const settings = computed(() => store.state.sensitivity.paramSettings);

        const showOptions = computed(() => !!settings.value.parameterToVary);
        const compileModelMessage = userMessages.sensitivity.compileRequiredForOptions;
        const editOpen = ref(false);

        const toggleEdit = (value: boolean) => {
            editOpen.value = value;
        };

        const batchPars = computed(() => store.getters[`sensitivity/${SensitivityGetter.batchPars}`]);

        return {
            settings,
            showOptions,
            compileModelMessage,
            toggleEdit,
            editOpen,
            batchPars
        };
    }
});
</script>
