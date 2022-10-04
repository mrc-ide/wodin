<template>
  <div class="container">
    <div class="row">
      <errors-alert></errors-alert>
      <h2>Sessions</h2>
    </div>
    <template v-if="sessionsMetadata">
      <template v-if="sessionsMetadata.length">
        <div class="row fw-bold py-2">
          <div class="col-3 session-col-header">Saved</div>
          <div class="col-2 session-col-header">Label</div>
          <div class="col-2 text-center session-col-header">Edit Label</div>
          <div class="col-1 text-center session-col-header">Load</div>
          <div class="col-4 text-center session-col-header">Share</div>
        </div>
        <div class="row py-2" v-for="session in sessionsMetadata" :key="session.id">
          <div class="col-3 session-col-value session-time">
            {{formatDateTime(session.time)}}
            <div v-if="isCurrentSession(session.id)" class="small text-muted">(current session)</div>
          </div>
          <div class="col-2 session-col-value session-label" :class="session.label ? '' : 'text-muted'">
            {{session.label || "--no label--"}}
          </div>
          <div class="col-2 text-center session-col-value session-edit-label">
            <vue-feather class="inline-icon brand clickable"
                         type="edit-2" @click="editSessionLabel(session.id, session.label)"></vue-feather>
          </div>
          <div class="col-1 text-center session-col-value session-load">
            <router-link v-if="isCurrentSession(session.id)" to="/">
              <vue-feather class="inline-icon brand" type="home"></vue-feather>
            </router-link>
            <a v-else :href="sessionUrl(session.id)">
              <vue-feather class="inline-icon brand" type="upload"></vue-feather>
            </a>
          </div>
          <div class="col-4 text-center session-col-value session-share brand">
            <span class="session-copy-link clickable" @click="copyLink(session)">
              <vue-feather class="inline-icon" type="copy"></vue-feather>
              Copy link
            </span>
            <span class="session-copy-code clickable ms-2" @click="copyCode(session)">
              <vue-feather class="inline-icon" type="copy"></vue-feather>
              Copy code
            </span>
          </div>
        </div>
      </template>
      <div id="empty-sessions" v-else>
        {{ messages.noSavedYet }}
        <router-link class="wodin-link" to="/">{{ messages.loadApplication.link }}</router-link>
        {{ messages.loadApplication.suffix }}
      </div>
    </template>
    <div id="loading-sessions" v-else>
      {{ messages.loading }}
    </div>
    <edit-session-label id="page-edit-session-label"
                        :open="editSessionLabelOpen"
                        :session-id="selectedSessionId"
                        :session-label="selectedSessionLabel"
                        @close="toggleEditSessionLabelOpen(false)"
    ></edit-session-label>
  </div>
</template>

<script lang="ts">
import { utc } from "moment";
import {
    onMounted, defineComponent, computed, ref, nextTick
} from "vue";
import { useStore } from "vuex";
import VueFeather from "vue-feather";
import { RouterLink } from "vue-router";
import { SessionsAction } from "../../store/sessions/actions";
import userMessages from "../../userMessages";
import ErrorsAlert from "../ErrorsAlert.vue";
import EditSessionLabel from "./EditSessionLabel.vue";
import { SessionMetadata } from "../../types/responseTypes";

export default defineComponent({
    name: "SessionsPage",
    components: {
        ErrorsAlert,
        EditSessionLabel,
        VueFeather,
        RouterLink
    },
    setup() {
        const store = useStore();

        const sessionsMetadata = computed(() => store.state.sessions.sessionsMetadata);
        const baseUrl = computed(() => store.state.config.baseUrl);
        const appName = computed(() => store.state.appName);
        const currentSessionId = computed(() => store.state.sessionId);

        const editSessionLabelOpen = ref(false);
        const selectedSessionId = ref<string | null>(null);
        const selectedSessionLabel = ref<string | null>(null);

        const formatDateTime = (isoUTCString: string) => {
            return utc(isoUTCString).local().format("DD/MM/YYYY HH:mm:ss");
        };

        const sessionUrl = (sessionId: string) => `/apps/${appName.value}?sessionId=${sessionId}`;
        const isCurrentSession = (sessionId: string) => sessionId === currentSessionId.value;

        const toggleEditSessionLabelOpen = (open: boolean) => {
            editSessionLabelOpen.value = open;
        };

        const editSessionLabel = (sessionId: string, sessionLabel: string) => {
            selectedSessionId.value = sessionId;
            selectedSessionLabel.value = sessionLabel;
            toggleEditSessionLabelOpen(true);
        };

        const ensureFriendlyId = async (session: SessionMetadata) => {
            if (session.friendlyId) {
                return session.friendlyId;
            }
            await store.dispatch(`sessions/${SessionsAction.GenerateFriendlyId}`, session.id);
            await nextTick();
            return sessionsMetadata.value.find((m: SessionMetadata) => m.id === session.id)?.friendlyId;
        };

        const copyText = (text: string) => {
            navigator.clipboard.writeText(text);
            console.log(`copied: ${text}`);
        };

        const copyLink = async (session: SessionMetadata) => {
            const friendlyId = await ensureFriendlyId(session);
            const link = `${baseUrl.value}/apps/${appName.value}/?share=${friendlyId}`;
            copyText(link);
        };

        const copyCode = async (session: SessionMetadata) => {
            const friendlyId = await ensureFriendlyId(session);
            copyText(friendlyId);
        };

        onMounted(() => {
            store.dispatch(`sessions/${SessionsAction.GetSessions}`);
        });

        const messages = userMessages.sessions;

        return {
            sessionsMetadata,
            formatDateTime,
            sessionUrl,
            isCurrentSession,
            editSessionLabelOpen,
            selectedSessionId,
            selectedSessionLabel,
            editSessionLabel,
            toggleEditSessionLabelOpen,
            copyLink,
            copyCode,
            messages
        };
    }
});
</script>

<style scoped>
  .container {
    max-width: 1140px;
  }
</style>
