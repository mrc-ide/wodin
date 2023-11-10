<template>
  <div>
    <div v-if="open" class="modal-backdrop fade show"></div>
    <div class="modal" :class="{ show: open }" :style="modalStyle">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
          </div>
          <div class="modal-body">
            {{ props.text }}
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="confirm-yes" @click="confirm">Yes</button>
            <button class="btn btn-outline" id="confirm-no" @click="close">No</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from "vue";

const props = defineProps({
  open: Boolean,
  title: String,
  text: String
});

const emit = defineEmits(["close", "confirm"]);

const modalStyle = computed(() => {
  return { display: props.open ? "block" : "none" };
});

const close = () => {
  emit("close");
};

const confirm = () => {
  emit("confirm");
  close();
};
</script>
