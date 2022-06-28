<template>
  <div>
    <input type="file" id="fitDataUpload" accept=".csv,.txt" @change="upload">
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import {FitDataAction} from "../../store/fitData/actions";

export default defineComponent({
    name: "DataTab",
    setup() {
        const store = useStore();
        const upload = (event: Event) => {
          const file = (event as any).target.files[0];
          store.dispatch(`fitData/${FitDataAction.Upload}`, file);
        };
        return {
            upload
        };
    }
});
</script>
