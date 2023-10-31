<template>
  <session-initialise-modal :open="appInitialised && !sessionInitialised"
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
import {AppStateGetter} from "../store/appState/getters";

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
        const appInitialised = computed(() => !!store.state.config);
        const latestSessionId: Ref<null|string> = ref(null);

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

        const initialise = (sessionId: string) => {
            store.dispatch(AppStateAction.InitialiseSession, sessionId);
            sessionInitialised.value = true;
        };

        watch(appInitialised, (newValue) => {
            // We don't need to show session initialise modal if showing the sessions page, or if we have a
            // loadSessionId or if there are no previous sessions
            const sessions = localStorageManager.getSessionIds(store.state.appName, store.getters[AppStateGetter.baseUrlPath]);
            latestSessionId.value = sessions.length ? sessions[0] : null;
            if (newValue && (loadSessionId || isSessionsRoute || !latestSessionId.value)) {
                initialise(loadSessionId || "");
            }
        });

        const newSession = () => {
            initialise("");
        };

        const reloadSession = () => {
            initialise(latestSessionId.value!);
        };

        return {
            sessionInitialised,
            appInitialised,
            newSession,
            reloadSession
        };
    }
});
</script>
