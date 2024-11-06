<template>
    <router-view v-if="initialised"></router-view>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { RouterView } from "vue-router";
import { useStore } from "vuex";
import { AppStateAction } from "../store/appState/actions";
import { ErrorsMutation } from "../store/errors/mutations";
import { localStorageManager } from "../localStorageManager";
import { AppStateGetter } from "../store/appState/getters";
import { SessionMetadata } from "../types/responseTypes";
import { SessionsMutation } from "../store/sessions/mutations";

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
        RouterView
    },
    setup(props) {
        const store = useStore();

        const initialised = ref(false);
        const appInitialised = computed(() => !!store.state.config && !!store.state.sessions.sessionsMetadata);

        // These props won't change as provided by server
         
        const { appName, baseUrl, loadSessionId, appsPath, enableI18n, defaultLanguage } = props;

        store.dispatch(AppStateAction.InitialiseApp, {
            appName,
            baseUrl,
            appsPath,
            enableI18n,
            defaultLanguage,
            loadSessionId
        });

        onMounted(() => {
            if (props.shareNotFound) {
                store.commit(`errors/${ErrorsMutation.AddError}`, {
                    detail: `Share id not found: ${props.shareNotFound}`
                });
            }
        });

        watch(appInitialised, () => {
            // Child component will either be SessionsPage or WodinApp depending on route - both will need the latest
            // session id so delay rendering these until this has been committed
            const baseUrlPath = store.getters[AppStateGetter.baseUrlPath];
            const sessions = localStorageManager.getSessionIds(store.state.appName, baseUrlPath);
            const sessionId = sessions.length ? sessions[0] : null;
            // check latest session id is actually available from the back end
            const sessionAvailable =
                sessionId && !!store.state.sessions.sessionsMetadata.find((s: SessionMetadata) => s.id === sessionId);
            if (sessionAvailable) {
                store.commit(`sessions/${SessionsMutation.SetLatestSessionId}`, sessionId);
            }
            initialised.value = true;
        });

        return {
            initialised
        };
    }
});
</script>
