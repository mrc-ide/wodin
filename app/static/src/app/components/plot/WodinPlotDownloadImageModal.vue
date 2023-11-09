<template>
  <div>
    <div class="modal-backdrop fade show"></div>
    <div class="modal show d-block">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Download Plot Image</h5>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-4">
                <label for="download-img-title" class="col-form-label">Title</label>
              </div>
              <div class="col-8 pe-0">
                <input id="download-img-title" type="text" class="form-control" v-model="editProps.title">
              </div>
            </div>
            <div class="row mt-2">
              <div class="col-4">
                <label for="download-img-x-label" class="col-form-label">X axis label</label>
              </div>
              <div class="col-8 pe-0">
                <input id="download-img-x-label" type="text" class="form-control" v-model="editProps.xLabel">
              </div>
            </div>
            <div class="row mt-2">
              <div class="col-4">
                <label for="download-img-y-label" class="col-form-label">Y axis label</label>
              </div>
              <div class="col-8 pe-0">
                <input id="download-img-y-label" type="text" class="form-control" v-model="editProps.yLabel">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary"
                    id="confirm-download-img"
                    @click="confirm">Download</button>
            <button class="btn btn-outline"
                    id="cancel-download-img"
                    @click="close">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineProps, defineEmits, reactive} from "vue";

const props = defineProps({
    title: String,
    xLabel: String,
    yLabel: String
});

const emit = defineEmits(["close", "confirm"]);

const editProps = reactive({
  title: props.title,
  xLabel: props.xLabel,
  yLabel: props.yLabel
});


const close = () => {
    emit("close");
};

const confirm = () => {
    emit("confirm", editProps.title, editProps.xLabel, editProps.yLabel);
    close();
};
</script>
