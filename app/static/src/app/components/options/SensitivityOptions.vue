<template>
  <h5 class="mt-4">Sensitivity Options</h5>
  <template v-if="showOptions">
    <vertical-collapse title="Vary Parameter" collapse-id="vary-parameter">
      <div class="mt-2">
        <div class="card">
          <div class="card-header">{{settings.parameterToVary}}</div>
          <div class="card-body">
            <ul>
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
          </div>
        </div>
        <button class="btn btn-primary mt-2 float-end" @click="toggleEdit(true)">Edit</button>
      </div>
    </vertical-collapse>
  </template>
  <template v-else>
    <div id="sensitivity-options-msg">
      {{compileModelMessage}}
    </div>
  </template>
  <edit-param-settings :open="editOpen" @close="toggleEdit(false)"></edit-param-settings>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { computed, defineComponent, ref } from "vue";
import userMessages from "../../userMessages";
import VerticalCollapse from "../VerticalCollapse.vue";
import EditParamSettings from "./EditParamSettings.vue";

export default defineComponent({
    name: "SensitivityOptions",
    components: {
        VerticalCollapse,
        EditParamSettings
    },
    setup() {
        const store = useStore();
        const settings = computed(() => store.state.sensitivity.paramSettings);

        const showOptions = computed(() => !!settings.value.parameterToVary);
        const compileModelMessage = userMessages.sensitivity.compileRequired;
        const editOpen = ref(false);

        const toggleEdit = (value: boolean) => {
            editOpen.value = value;
        };

        return {
            settings,
            showOptions,
            compileModelMessage,
            toggleEdit,
            editOpen
        };
    }
});
</script>
