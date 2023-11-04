<template>
  <div>
    <div v-if="open" class="modal-backdrop fade show"></div>
    <div class="modal" :class="{show: open}" :style="modalStyle">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Download Plot Image</h5>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-4">
                <label class="col-form-label">Title</label>
              </div>
              <div class="col-8 pe-0">
                <input type="text" class="form-control" v-model="editTitle">
              </div>
            </div>
            <div class="row">
              <div class="col-4">
                <label class="col-form-label">X axis label</label>
              </div>
              <div class="col-8 pe-0">
                <input type="text" class="form-control" v-model="editXLabel">
              </div>
            </div>
            <div class="row">
              <div class="col-4">
                <label class="col-form-label">Y axis label</label>
              </div>
              <div class="col-8 pe-0">
                <input type="text" class="form-control" v-model="editYLabel">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary"
                    id="confirm-download-plot-image"
                    @click="confirm">Download</button>
            <button class="btn btn-outline"
                    id="cancel-download-plot-image"
                    @click="close">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, defineEmits, ref} from "vue";

const props = defineProps({
    open: Boolean,
    title: String,
    xLabel: String,
    yLabel: String
});

const emit = defineEmits(["close", "confirm"]);

const editTitle = ref(props.title);
const editXLabel = ref(props.xLabel);
const editYLabel = ref(props.yLabel);

const modalStyle = computed(() => {
    return { display: props.open ? "block" : "none" };
});

const close = () => {
    emit("close");
};

const confirm = () => {
    emit("confirm", editTitle.value, editXLabel.value, editYLabel.value);
    close();
};
</script>
