<template>
  <div class="container">
    <div class="row">
      <errors-alert></errors-alert>
      <h2>Sessions</h2>
    </div>
    <div class="row mb-3" id="no-current-session" v-if="!currentSession">
        <span>
          <router-link to="/" class="brand-link">
            Start a new session
          </router-link>
          <span v-if="previousSessions && previousSessions.length" id="load-previous-span">
            or load a previous session.
          </span>
        </span>
    </div>
    <div class="row mb-3" id="current-session" v-else>
      <p>
        <router-link to="/" class="brand-link">
          Return to the current session
        </router-link>
        or
        <a class="brand-link" :href="sessionUrl(currentSessionId)">
          make a copy of the current session.
        </a>
      </p>
      <div>
        <span class="session-copy-link clickable brand"
              @click="copyLink(currentSession)"
              @mouseleave="clearLastCopied">
          <vue-feather class="inline-icon" type="copy"></vue-feather>
          Copy link for current session
        </span>
        <span class="session-copy-code clickable brand ms-2"
              @click="copyCode(currentSession)"
              @mouseleave="clearLastCopied">
          <vue-feather class="inline-icon" type="copy"></vue-feather>
          Copy code for current session
        </span>
        <br/>
        <div class="session-copy-confirm small text-muted text-nowrap float-start" style="height:0.8rem;">
          {{getCopyMsg(currentSession)}}
        </div>
      </div>
    </div>
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
              @click="loadSessionFromCode"
              :disabled="!sessionCode">Load</button>
    </div>
    <h3>Previous sessions</h3>
    <p>
      <input id="show-unlabelled-check" type="checkbox" class="form-check-input" v-model="showUnlabelledSessions" />
      <label for="show-unlabelled-check" class="form-check-label ms-2">Show unlabelled sessions</label>
      <input id="show-duplicates-check" type="checkbox" class="form-check-input ms-4" v-model="showDuplicateSessions" />
      <label for="show-duplicates-check" class="form-check-label ms-2">Show duplicate sessions</label>
    </p>
    <template v-if="previousSessions && previousSessions.length">
        <div class="row fw-bold py-2" id="previous-sessions-headers">
          <div class="col-2 session-col-header">Saved</div>
          <div class="col-2 session-col-header">Label</div>
          <div class="col-2 text-center session-col-header">Edit Label</div>
          <div class="col-1 text-center session-col-header">Load</div>
          <div class="col-1 text-center session-col-header">Delete</div>
          <div class="col-4 text-center session-col-header">Shareable Link</div>
        </div>
        <div class="row py-2 previous-session-row" v-for="session in previousSessions" :key="session.id">
          <div class="col-2 session-col-value session-time">
            {{formatDateTime(session.time)}}
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
            <a class="ms-2" :href="sessionUrl(session.id)" title="Load as new session">
              <vue-feather class="inline-icon brand" type="upload"></vue-feather>
            </a>
          </div>
          <div class="col-1 text-center session-col-value session-delete">
            <vue-feather class="inline-icon brand clickable"
                         type="trash-2"
                         @click="confirmDeleteSession(session.id)"></vue-feather>
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
    <p v-else id="previous-sessions-placeholder">
      Saved sessions will appear here.
    </p>
    <div id="loading-sessions" v-if="!previousSessions">
      {{ messages.loading }}
    </div>
    <edit-session-label id="page-edit-session-label"
                        :open="editSessionLabelOpen"
                        :session-id="selectedSessionId"
                        :session-label="selectedSessionLabel"
                        @close="toggleEditSessionLabelOpen(false)"
                        @confirm="deleteSession"
    ></edit-session-label>
    <confirm-modal id="confirm-delete-session"
                   :title="'Delete session'"
                   :text="'Do you want to delete this session?'"
                   :open="confirmDeleteSessionOpen"
                   @close="toggleConfirmDeleteSessionOpen(false)"
                   @confirm="deleteSession"
                  ></confirm-modal>
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
import { AppStateAction } from "../../store/appState/actions";
import { SessionsAction } from "../../store/sessions/actions";
import userMessages from "../../userMessages";
import ErrorsAlert from "../ErrorsAlert.vue";
import EditSessionLabel from "./EditSessionLabel.vue";
import { SessionMetadata } from "../../types/responseTypes";
import ConfirmModal from "../ConfirmModal.vue";

export default defineComponent({
    name: "SessionsPage",
    components: {
        ErrorsAlert,
        EditSessionLabel,
        VueFeather,
        RouterLink,
        ConfirmModal
    },
    setup() {
        const store = useStore();
        const namespace = "sessions";
        const sessionCode = ref("");

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

        const sessionIdToDelete = ref("");

        const formatDateTime = (isoUTCString: string) => {
            return utc(isoUTCString).local().format("DD/MM/YYYY HH:mm:ss");
        };

        const appUrl = computed(() => `${baseUrl.value}/${appsPath.value}/${appName.value}/`);

        const sessionUrl = (sessionId: string) => `${appUrl.value}?sessionId=${sessionId}`;

        const showUnlabelledSessions = computed({
            get() {
                return store.state.userPreferences?.showUnlabelledSessions;
            },
            set(newValue: boolean) {
                store.dispatch(AppStateAction.SaveUserPreferences, { showUnlabelledSessions: newValue });
            }
        });

        const showDuplicateSessions = computed({
            get() {
                return store.state.userPreferences?.showDuplicateSessions;
            },
            set(newValue: boolean) {
                store.dispatch(AppStateAction.SaveUserPreferences, { showDuplicateSessions: newValue });
            }
        });

        const isCurrentSession = (sessionId: string) => sessionId === currentSessionId.value;

        const previousSessions = computed(() => {
            return sessionsMetadata.value?.filter((s: SessionMetadata) => {
                return !isCurrentSession(s.id) && (showUnlabelledSessions.value || s.label);
            });
        });

        const currentSession = computed(() => {
            return sessionsMetadata.value?.find((s: SessionMetadata) => isCurrentSession(s.id));
        });

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
            await store.dispatch(`${namespace}/${SessionsAction.GenerateFriendlyId}`, session.id);
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

        const getShareSessionLink = (friendlyId: string) => {
            return `${appUrl.value}?share=${friendlyId}`;
        };

        const copyLink = async (session: SessionMetadata) => {
            const friendlyId = await ensureFriendlyId(session);
            if (friendlyId) {
                const link = getShareSessionLink(friendlyId);
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

        const confirmDeleteSessionOpen = ref(false);
        const toggleConfirmDeleteSessionOpen = (open: boolean) => {
            confirmDeleteSessionOpen.value = open;
        };
        const confirmDeleteSession = (sessionId: string) => {
            sessionIdToDelete.value = sessionId;
            toggleConfirmDeleteSessionOpen(true);
        };

        const deleteSession = () => {
            store.dispatch(`${namespace}/${SessionsAction.DeleteSession}`, sessionIdToDelete.value);
        };

        const loadSessionFromCode = () => {
            const link = getShareSessionLink(sessionCode.value);
            window.location.assign(link);
        };

        onMounted(async () => {
            await store.dispatch(AppStateAction.LoadUserPreferences);
            store.dispatch(`${namespace}/${SessionsAction.GetSessions}`);
        });

        const messages = userMessages.sessions;

        return {
            previousSessions,
            currentSession,
            formatDateTime,
            sessionUrl,
            currentSessionId,
            editSessionLabelOpen,
            selectedSessionId,
            selectedSessionLabel,
            lastCopySessionId,
            lastCopyMsg,
            confirmDeleteSessionOpen,
            editSessionLabel,
            toggleEditSessionLabelOpen,
            copyLink,
            copyCode,
            getCopyMsg,
            clearLastCopied,
            confirmDeleteSession,
            toggleConfirmDeleteSessionOpen,
            deleteSession,
            showUnlabelledSessions,
            showDuplicateSessions,
            sessionCode,
            loadSessionFromCode,
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
