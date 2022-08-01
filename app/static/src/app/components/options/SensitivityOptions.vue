<template>
  <h4>Sensitivity Options</h4>
  <template v-if="showOptions">
    <vertical-collapse title="Vary Parameter" collapse-id="vary-parameter">
      <div>
        {{JSON.stringify(settings)}}
        <button class="btn btn-primary" @click="toggleEdit(true)">Edit</button>
      </div>
    </vertical-collapse>
  </template>
  <template v-else>
    {{compileModelMessage}}
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
