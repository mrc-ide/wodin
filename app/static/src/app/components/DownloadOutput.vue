<template>
  <div>
    <div v-if="open" class="modal-backdrop fade show"></div>
    <div class="modal" :class="{show: open}" :style="style">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Download Run</h5>
          </div>
          <div class="modal-body">
            <div class="row" id="download-file-name">
              <div class="col-4">
                <label class="col-form-label">File name</label>
              </div>
              <div class="col-8">
                <input type="text" class="form-control" :value="fileName" @change="updateUserFileName">
              </div>
            </div>
            <div class="row mt-2" id="download-points">
              <div class="col-4">
                <label class="col-form-label">Modelled points</label>
              </div>
              <div class="col-8">
                <input type="number" class="form-control" v-model="points">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary"
                    :disabled="canDownload"
                    id="ok-download"
                    @click="downloadOutput">OK</button>
            <button class="btn btn-outline"
                    id="cancel-download"
                    @click="close">Cancel</button>
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

        const fileName = ref("");
        const points = ref(501);

        const appName = computed(() => store.state.appName);
        const userFileName = computed(() => store.state.run.userDownloadFileName);

        const style = computed(() => {
            return { display: props.open ? "block" : "none" };
        });

        const canDownload = computed(() => false);

        const generateDefaultFileName = () => {
            const timestamp = utc().local().format("YMMDD-HHmmss");
            return `${appName.value}-run-${timestamp}.xlsx`;
        };

        const updateUserFileName = (event: InputEvent) => {
            const newValue = (event.target as HTMLInputElement).value;
            fileName.value = newValue;
            store.commit(`run/${RunMutation.SetUserDownloadFileName}`, newValue);
        };

        const close = () => { emit("close"); };
        const downloadOutput = () => {
            // User can erase the filename in the text box so the userDownloadFileName is reset, but in this case,
            // generate a new default to actually save to
            if (!fileName.value) {
                fileName.value = generateDefaultFileName();
            }
            store.dispatch(`run/${RunAction.DownloadOutput}`, { fileName: fileName.value, points: points.value });
            close();
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
            close,
            downloadOutput,
            updateUserFileName
        };
    }
});
</script>
