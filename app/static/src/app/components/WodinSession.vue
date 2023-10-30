<template>
  <session-initialise-modal :open="!sessionInitialised"
                            @new-session="newSession"
                            @reload-session="reloadSession"></session-initialise-modal>
  <router-view v-if="sessionInitialised"></router-view>
</template>

<script lang="ts">
import {
    defineComponent, onMounted, ref
} from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { AppStateMutation } from "../store/appState/mutations";
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

        // TODO: These are undefined ,but they shouldn't be... Get router undefined error when load session from Sessions page
       // (loadSessionId is set)
        const route = useRoute();
        const router = useRouter();

        const {
            appName,
            baseUrl,
            loadSessionId,
            appsPath,
            enableI18n,
            defaultLanguage
        } = props;

        store.commit(AppStateMutation.SetApp, {
            appName,
            baseUrl,
            appsPath,
            enableI18n,
            defaultLanguage
        });

        // We don't need to show session initialise modal if showing the sessions page, or..
        // TODO: if no previous sessions...
        // Can't use the router here to check route as it isn't set up
        // const sessionInitialised = ref(route.fullPath.endsWith("sessions"));
        const sessionInitialised = ref(false);

        const initialise = (sessionId: string) => {
            store.dispatch(AppStateAction.Initialise,
                {
                    appName,
                    baseUrl,
                    sessionId,
                    appsPath,
                    enableI18n,
                    defaultLanguage
                });
            sessionInitialised.value = true;
        };

        // If we have a loadSessionId we can initialise the session right away with the requested id
        if (loadSessionId) {
            initialise(loadSessionId);
        }

        // const initialised = computed(() => !!(store.state.appName && store.state.baseUrl && store.state.appsPath));

        onMounted(() => {
            if (props.shareNotFound) {
                store.commit(`errors/${ErrorsMutation.AddError}`,
                    { detail: `Share id not found: ${props.shareNotFound}` });
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

        return {
            sessionInitialised,
            newSession,
            reloadSession
        };
    }
});
</script>
