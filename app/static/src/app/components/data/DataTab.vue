<template>
  <h3>Upload data</h3>
  <div>
    <input
      type="file"
      id="fitDataUpload"
      accept=".csv,.txt"
      @change="upload"
      @click="clearCurrentFile"
      class="form-control"
    />
  </div>
  <div v-if="success" class="mt-2" id="data-upload-success">
    <vue-feather class="inline-icon text-success" type="check"></vue-feather>
    Uploaded {{ rows }} rows and {{ columns }} columns
  </div>
  <error-info :error="error"></error-info>
  <div v-if="timeVariableCandidates" id="time-variable" class="mt-4">
    <label for="select-time-variable" class="fw-bold"> Select time variable </label>
    <select id="select-time-variable" class="form-select" v-model="timeVariable" @change="updateTimeVariable">
      <option v-for="timeVar in timeVariableCandidates" :key="timeVar" :value="timeVar">
        {{ timeVar }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import VueFeather from "vue-feather";
import { FitDataAction } from "../../store/fitData/actions";
import ErrorInfo from "../ErrorInfo.vue";

export default defineComponent({
  name: "DataTab",
  components: {
    ErrorInfo,
    VueFeather
  },
  setup() {
    const store = useStore();
    const upload = (event: InputEvent) => {
      const file = (event.target! as HTMLInputElement).files![0];
      store.dispatch(`fitData/${FitDataAction.Upload}`, file);
    };

    const clearCurrentFile = (event: InputEvent) => {
      const target = event.target! as HTMLInputElement;
      target.value = ""; // Allow file re-upload
    };

    const updateTimeVariable = (event: Event) => {
      const { value } = event.target as HTMLSelectElement;
      store.dispatch(`fitData/${FitDataAction.UpdateTimeVariable}`, value);
    };

    const error = computed(() => store.state.fitData.error);
    const success = computed(() => !!store.state.fitData.data);
    const rows = computed(() => store.state.fitData.data?.length);
    const columns = computed(() => store.state.fitData.columns?.length);
    const timeVariableCandidates = computed(() => store.state.fitData.timeVariableCandidates);
    const timeVariable = computed(() => store.state.fitData.timeVariable);

    return {
      clearCurrentFile,
      upload,
      updateTimeVariable,
      error,
      success,
      rows,
      columns,
      timeVariableCandidates,
      timeVariable
    };
  }
});
</script>
