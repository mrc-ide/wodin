<template>
  <session-initialise-modal :open="appInitialised && !sessionInitialised"
                            @new-session="newSession"
                            @reload-session="reloadSession"></session-initialise-modal>
  <router-view v-if="appInitialised"></router-view>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, onMounted, ref, watch
} from "vue";
import { RouterView } from "vue-router";
import { useStore } from "vuex";
import SessionInitialiseModal from "./SessionInitialiseModal.vue";
import { AppStateAction } from "../store/appState/actions";
import { ErrorsMutation } from "../store/errors/mutations";

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

        // We don't need to show session initialise modal if showing the sessions page, or..
        // TODO: if no previous sessions...
        const sessionInitialised = ref(isSessionsRoute);
        const appInitialised = computed(() => !!store.state.config);

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
            if (newValue) {
              console.log("app initialised")
            }
            // If we have a loadSessionId we can initialise the session as soon as app config is loaded, with id
            if (newValue && loadSessionId) {
                initialise(loadSessionId);
            }
        });

        const newSession = () => {
            initialise("");
        };

        const reloadSession = () => {
            // TODO: find the most recent session id from local store
            // Expected behaviour: right now, both buttons should launch a fresh new session
            initialise("");
        };

        console.log("completed setup")
        return {
            sessionInitialised,
            appInitialised,
            newSession,
            reloadSession
        };
    }
});
</script>
