<template>
  <div>
    <input type="file" id="fitDataUpload" accept=".csv,.txt" @change="upload">
  </div>
  <div v-if="success">
    Uploaded {{rows}} rows and {{columns}} columns
  </div>
  <div>{{data}}</div>
  <error-info :error="error"></error-info>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import {FitDataAction} from "../../store/fitData/actions";
import ErrorInfo from "../ErrorInfo.vue";

export default defineComponent({
    name: "DataTab",
    components: {
      ErrorInfo
    },
    setup() {
        const store = useStore();
        const upload = (event: Event) => {
          const file = (event as any).target.files[0];
          store.dispatch(`fitData/${FitDataAction.Upload}`, file);
        };

        const error = computed(() => store.state.fitData.error);
        const success = computed(() => !!store.state.fitData.data);
        const rows = computed(() => store.state.fitData.data?.length);
        const columns = computed(() => store.state.fitData.columns?.length);
        const data = computed(() => JSON.stringify(store.state.fitData.data)); //testing only

        return {
            upload,
            error,
            success,
            rows,
            columns,
            data
        };
    }
});
</script>
