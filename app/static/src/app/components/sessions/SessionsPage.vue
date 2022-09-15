<template>
  <div class="container">
    <div class="row">
      <h2>Sessions</h2>
    </div>
    <template v-if="sessionsMetadata">
      <template v-if="sessionsMetadata.length">
        <div class="row fw-bold py-2">
          <div class="col-3 session-col-header">Saved</div>
          <div class="col-2 session-col-header">Label</div>
          <div class="col-2 text-center session-col-header">Load</div>
        </div>
        <div class="row py-2" v-for="session in sessionsMetadata" :key="session.id">
          <div class="col-3 session-col-value session-time">
            {{formatDateTime(session.time)}}
            <div v-if="isCurrentSession(session.id)" class="small text-muted">(current session)</div>
          </div>
          <div class="col-2 session-col-value session-label" :class="session.label ? '' : 'text-muted'">
            {{session.label || "--no label--"}}
          </div>
          <div class="col-2 text-center session-col-value session-load">
            <router-link v-if="isCurrentSession(session.id)" to="/">
              <vue-feather class="inline-icon brand" type="home"></vue-feather>
            </router-link>
            <a v-else :href="sessionUrl(session.id)">
              <vue-feather class="inline-icon brand" type="upload"></vue-feather>
            </a>
          </div>
        </div>
      </template>
      <div id="empty-sessions" v-else>
        No saved sessions yet.
        <router-link class="wodin-link" to="/">Load the application</router-link> to create a new session.
      </div>
    </template>
    <div id="loading-sessions" v-else>
      Loading sessions...
    </div>
  </div>
</template>

<script lang="ts">
import { utc } from "moment";
import { onMounted, defineComponent, computed } from "vue";
import { useStore } from "vuex";
import VueFeather from "vue-feather";
import { RouterLink } from "vue-router";
import { SessionsAction } from "../../store/sessions/actions";

export default defineComponent({
    name: "SessionsPage",
    components: {
        VueFeather,
        RouterLink
    },
    setup() {
        const store = useStore();

        const sessionsMetadata = computed(() => store.state.sessions.sessionsMetadata);
        const appName = computed(() => store.state.appName);
        const currentSessionId = computed(() => store.state.sessionId);

        const formatDateTime = (isoUTCString: string) => {
            return utc(isoUTCString).local().format("DD/MM/YYYY HH:mm:ss");
        };

        const sessionUrl = (sessionId: string) => `/apps/${appName.value}?sessionId=${sessionId}`;
        const isCurrentSession = (sessionId: string) => sessionId === currentSessionId.value;

        onMounted(() => {
            store.dispatch(`sessions/${SessionsAction.GetSessions}`);
        });

        return {
            sessionsMetadata,
            formatDateTime,
            sessionUrl,
            isCurrentSession
        };
    }
});
</script>

<style scoped>
  .container {
    max-width: 1140px;
  }
</style>
