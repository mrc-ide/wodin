<template>
  <div>
    <div v-if="open" class="modal-backdrop fade show"></div>
    <div class="modal" :class="{show: open}" :style="style">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Download Model</h5>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-6">
                <label class="col-form-label">File</label>
              </div>
              <div class="col-6">
                <input type="text" class="form-control" v-model="fileName">
              </div>
            </div>
            <div class="row mt-2">
              <div class="col-6">
                <label class="col-form-label">Modelled points</label>
              </div>
              <div class="col-6">
                <input type="number" class="form-control" v-model="points">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary"
                    :disabled="canDownload"
                    id="ok-settings"
                    @click="downloadOutput">OK</button>
            <button class="btn btn-outline"
                    id="cancel-settings"
                    @click="close">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed, defineComponent, ref
} from "vue";
import { useStore } from "vuex";
import {RunAction} from "../store/run/actions";

export default defineComponent({
    name: "DownloadOutput",
    props: {
        open: {
            type: Boolean,
            required: true
        }
    },
    setup(props, { emit }) {
        const store = useStore();

        const fileName = ref("model.xlsx");
        const points = ref(501);

        const style = computed(() => {
          return { display: props.open ? "block" : "none" };
        });

        const canDownload = computed(() => false);

        const close = () => { emit("close"); };
        const downloadOutput = () => {
          store.dispatch(`run/${RunAction.DownloadOutput}`, {fileName: fileName.value, points: points.value});
          close();
        };

        return {
            fileName,
            points,
            style,
            canDownload,
            close,
            downloadOutput
        };
    }
});
</script>
