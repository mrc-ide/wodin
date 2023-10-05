<template>
  <div class="mb-4">
    <label for="session-code-input" class="">Load session from code:</label>
    <input id="session-code-input"
           v-model="sessionCode"
           type="text"
           placeholder="Session code"
           class="form-control d-inline mx-2"
           style="width: 20rem;"/>
    <button id="load-session-from-code"
            class="btn btn-primary"
            @click="loadSession"
            :disabled="!sessionCode">Load</button>
  </div>
</template>
<script setup lang="ts">
  import { ref } from "vue";

  const sessionCode = ref("");
  const loadSession = () => {

  };
</script>
