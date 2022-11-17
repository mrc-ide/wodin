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
          <div class="col-4 text-center session-col-header">Shareable Link</div>
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
                         type="edit-2"
                         @click="editSessionLabel(session.id, session.label)"></vue-feather>
          </div>
          <div class="col-1 text-center session-col-value session-load">
            <router-link v-if="isCurrentSession(session.id)" to="/" title="Return to session">
              <vue-feather class="inline-icon brand" type="home"></vue-feather>
            </router-link>
            <a :href="sessionUrl(session.id)" title="Load as new session">
              <vue-feather class="inline-icon brand" type="upload"></vue-feather>
            </a>
          </div>
          <div class="col-4 session-col-value session-share brand">
              <div class="mx-auto" style="width: 16rem">
                <span class="session-copy-link clickable" @click="copyLink(session)" @mouseleave="clearLastCopied">
                  <vue-feather class="inline-icon" type="copy"></vue-feather>
                  Copy link
                </span>
                <span class="session-copy-code clickable ms-2" @click="copyCode(session)" @mouseleave="clearLastCopied">
                  <vue-feather class="inline-icon" type="copy"></vue-feather>
                  Copy code
                </span>
                <br/>
                <div class="session-copy-confirm small text-muted text-nowrap float-start" style="height:0.8rem;">
                  {{getCopyMsg(session)}}
                </div>
              </div>
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
        const baseUrl = computed(() => store.state.baseUrl);
        const appName = computed(() => store.state.appName);
        const appsPath = computed(() => store.state.appsPath);
        const currentSessionId = computed(() => store.state.sessionId);

        const editSessionLabelOpen = ref(false);
        const selectedSessionId = ref<string | null>(null);
        const selectedSessionLabel = ref<string | null>(null);

        const lastCopySessionId = ref<string | null>(null);
        const lastCopyMsg = ref<string | null>(null); // Feedback message to show under last copy control clicked

        const formatDateTime = (isoUTCString: string) => {
            return utc(isoUTCString).local().format("DD/MM/YYYY HH:mm:ss");
        };

        const appUrl = computed(() => `${baseUrl.value}/${appsPath.value}/${appName.value}/`);

        const sessionUrl = (sessionId: string) => `${appUrl.value}?sessionId=${sessionId}`;
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
            lastCopySessionId.value = session.id;
            if (session.friendlyId) {
                return session.friendlyId;
            }
            lastCopyMsg.value = "Fetching code...";
            await store.dispatch(`sessions/${SessionsAction.GenerateFriendlyId}`, session.id);
            await nextTick();
            const friendlyId = sessionsMetadata.value.find((m: SessionMetadata) => m.id === session.id)?.friendlyId;
            if (!friendlyId) {
                lastCopyMsg.value = "Error fetching code";
            }
            return friendlyId;
        };

        const copyText = (text: string) => {
            window.navigator.clipboard.writeText(text);
            lastCopyMsg.value = `Copied: ${text}`;
        };

        const copyLink = async (session: SessionMetadata) => {
            const friendlyId = await ensureFriendlyId(session);
            if (friendlyId) {
                const link = `${appUrl.value}?share=${friendlyId}`;
                copyText(link);
            }
        };

        const copyCode = async (session: SessionMetadata) => {
            const friendlyId = await ensureFriendlyId(session);
            if (friendlyId) {
                copyText(friendlyId);
            }
        };

        const getCopyMsg = (session: SessionMetadata) => {
            return session.id === lastCopySessionId.value ? lastCopyMsg.value : null;
        };

        const clearLastCopied = () => {
            lastCopySessionId.value = null;
            lastCopyMsg.value = null;
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
            lastCopySessionId,
            lastCopyMsg,
            editSessionLabel,
            toggleEditSessionLabelOpen,
            copyLink,
            copyCode,
            getCopyMsg,
            clearLastCopied,
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
