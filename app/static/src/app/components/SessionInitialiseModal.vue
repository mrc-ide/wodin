<template>
  <div id="session-initialise-modal">
    <div v-if="open" class="modal-backdrop fade show"></div>
    <div class="modal" :class="{show: open}" :style="modalStyle">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">WODIN Session</h5>
          </div>
          <div class="modal-body">
            {{ modalText }}
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary"
                    id="reload-session"
                    @click="emit('reloadSession')">Reload session</button>
            <button class="btn btn-primary"
                    id="new-session"
                    @click="emit('newSession')">New session</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, defineProps, defineEmits } from "vue";
import userMessages from "../userMessages";

const props = defineProps({
  open: Boolean
});

const emit = defineEmits(["newSession", "reloadSession"]);

const modalStyle = computed(() => {
  return { display: props.open ? "block" : "none" };
});

const modalText = userMessages.sessions.initialise;
</script>