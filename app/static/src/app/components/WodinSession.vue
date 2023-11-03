<template>
  <session-initialise-modal :open="appInitialised && !sessionInitialised && !isSessionsRoute"
                            @new-session="newSession"
                            @reload-session="reloadSession"></session-initialise-modal>
  <router-view v-if="appInitialised"></router-view>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, onMounted, Ref, ref, watch
} from "vue";
import { RouterView } from "vue-router";
import { useStore } from "vuex";
import SessionInitialiseModal from "./SessionInitialiseModal.vue";
import { AppStateAction } from "../store/appState/actions";
import { ErrorsMutation } from "../store/errors/mutations";
import { localStorageManager } from "../localStorageManager";
import { AppStateGetter } from "../store/appState/getters";
import { SessionMetadata } from "../types/responseTypes";

export default defineComponent({
    name: "WodinSession",
    props: {
        appName: String,
        baseUrl: String,
        appsPath: String,
        loadSessionId: String,
        shareNotFound: String,
        enableI18n: Boolean,
        defaultLanguage: String
    },
    components: {
        SessionInitialiseModal,
        RouterView
    },
    setup(props) {
        const store = useStore();

        const path = new URL(window.location.href).pathname;
        const isSessionsRoute = !!path.match(/\/sessions\/?$/);
        const sessionInitialised = ref(false);
        const appInitialised = computed(() => !!store.state.config && !!store.state.sessions.sessionsMetadata);
        const latestSessionId: Ref<null|string> = ref(null);

        // These props won't change as provided by server
        // eslint-disable-next-line vue/no-setup-props-destructure
        const {
            appName,
            baseUrl,
            loadSessionId,
            appsPath,
            enableI18n,
            defaultLanguage
        } = props;

        store.dispatch(AppStateAction.InitialiseApp, {
            appName,
            baseUrl,
            appsPath,
            enableI18n,
            defaultLanguage
        });

        onMounted(() => {
            if (props.shareNotFound) {
                store.commit(`errors/${ErrorsMutation.AddError}`,
                    { detail: `Share id not found: ${props.shareNotFound}` });
            }
        });

        const initialise = (sessionId: string, copySession = true) => {
            store.dispatch(AppStateAction.InitialiseSession, { loadSessionId: sessionId, copySession });
            sessionInitialised.value = true;
        };

        watch(appInitialised, (newValue) => {
            // We don't need to show session initialise modal if we have a  loadSessionId (loading from share) or if
            // there are no previous sessions - initialise as soon as config available
            const baseUrlPath = store.getters[AppStateGetter.baseUrlPath];
            const sessions = localStorageManager.getSessionIds(store.state.appName, baseUrlPath);
            const sessionId = sessions.length ? sessions[0] : null;
            // check latest session id is actually available from the back end
            const sessionAvailable = sessionId
                && !!store.state.sessions.sessionsMetadata.find((s: SessionMetadata) => s.id === sessionId);
            if (sessionAvailable) {
                latestSessionId.value = sessionId;
            }

            if (newValue && (loadSessionId || !latestSessionId.value)) {
                initialise(loadSessionId || "");
            }
        });

        const newSession = () => {
            initialise("");
        };

        const reloadSession = () => {
            initialise(latestSessionId.value!, false);
        };

        return {
            sessionInitialised,
            appInitialised,
            isSessionsRoute,
            newSession,
            reloadSession
        };
    }
});
</script>
