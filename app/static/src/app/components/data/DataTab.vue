<template>
  <h3>Upload data</h3>
  <div>
    <input type="file" id="fitDataUpload" accept=".csv,.txt" @change="upload" class="form-control">
  </div>
  <div v-if="success" class="mt-2">
    <vue-feather class="inline-icon text-success" type="check"></vue-feather>
    Uploaded {{rows}} rows and {{columns}} columns
  </div>
  <error-info :error="error"></error-info>
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

        const error = computed(() => store.state.fitData.error);
        const success = computed(() => !!store.state.fitData.data);
        const rows = computed(() => store.state.fitData.data?.length);
        const columns = computed(() => store.state.fitData.columns?.length);

        return {
            upload,
            error,
            success,
            rows,
            columns
        };
    }
});
</script>
