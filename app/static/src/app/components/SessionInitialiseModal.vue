<template>
  <div id="session-initialise-modal">
    <div class="modal-backdrop fade show"></div>
    <div class="modal show d-block">
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
                    name=""
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
import { defineEmits } from "vue";
import userMessages from "../userMessages";

const emit = defineEmits(["newSession", "reloadSession"]);

const modalText = userMessages.sessions.initialise;
</script>
