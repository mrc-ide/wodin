<template>
  <div>
    <div v-if="open" class="modal-backdrop fade show"></div>
    <div class="modal" :class="{show: open}" :style="style">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content px-2">
          <div class="modal-header">
            <h5 class="modal-title">Download Run</h5>
          </div>
          <div class="modal-body">
            <div class="row" id="download-file-name">
              <div class="col-4">
                <label class="col-form-label">File name</label>
              </div>
              <div class="col-7 pe-0">
                <input type="text" class="form-control" :value="fileName" @change="updateUserFileName">
              </div>
              <div class="col-1 ps-0">
                <label class="col-form-label">.xlsx</label>
              </div>
            </div>
            <div class="row mt-2" id="download-points">
              <div class="col-4">
                <label class="col-form-label">Modelled points</label>
              </div>
              <div class="col-7 pe-0">
                <input type="number" class="form-control" v-model="points">
              </div>
            </div>
            <div class="row mt-2 small text-danger">
              <div id="download-invalid" class="col-12" style="min-height: 1.5rem;">
                {{ canDownload ? "" : cannotDownloadMessage }}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary"
                    :disabled="!canDownload"
                    id="ok-download"
                    @click="downloadOutput">OK</button>
            <button class="btn btn-outline"
                    id="cancel-download"
                    @click="closeModal">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, ref, watch
} from "vue";
import { useStore } from "vuex";
import { utc } from "moment";
import { RunAction } from "../store/run/actions";
import { RunMutation } from "../store/run/mutations";
import userMessages from "../userMessages";

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

        const cannotDownloadMessage = userMessages.download.invalidPoints;

        const fileName = ref("");
        const points = ref(501);

        const appName = computed(() => store.state.appName);
        const userFileName = computed(() => store.state.run.userDownloadFileName);

        const style = computed(() => {
            return { display: props.open ? "block" : "none" };
        });

        // Do not allow number of excel rows outside these bounds
        const canDownload = computed(() => points.value > 0 && points.value <= 500001);

        const generateDefaultFileName = () => {
            const timestamp = utc().local().format("YMMDD-HHmmss");
            return `${appName.value}-run-${timestamp}`;
        };

        const updateUserFileName = (event: InputEvent) => {
            const newValue = (event.target as HTMLInputElement).value;
            fileName.value = newValue;
            store.commit(`run/${RunMutation.SetUserDownloadFileName}`, newValue);
        };

        const closeModal = () => { emit("close"); };
        const downloadOutput = () => {
            // User can erase the filename in the text box so the userDownloadFileName is reset, but in this case,
            // generate a new default to actually save to
            if (!fileName.value) {
                fileName.value = generateDefaultFileName();
            }
            const fileNameWithSuffix = `${fileName.value}.xlsx`;
            store.dispatch(`run/${RunAction.DownloadOutput}`, { fileName: fileNameWithSuffix, points: points.value });
            closeModal();
        };

        watch(() => props.open, (newOpen) => {
            if (newOpen) {
                fileName.value = userFileName.value || generateDefaultFileName();
            }
        });

        return {
            fileName,
            points,
            style,
            canDownload,
            cannotDownloadMessage,
            closeModal,
            downloadOutput,
            updateUserFileName
        };
    }
});
</script>
