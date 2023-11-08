<template>
    <session-initialise-modal v-if="!sessionInitialised && !immediateInitialise"
                            @new-session="newSession"
                            @reload-session="reloadSession"></session-initialise-modal>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div v-if="loading" class="text-center center-of-screen">
                  <loading-spinner size="lg"></loading-spinner>
                  <h2 id="loading-message">Loading application...</h2>
                </div>
                <errors-alert></errors-alert>
                <wodin-panels v-if="!loading" >
                    <template v-slot:left>
                      <slot name="left"></slot>
                    </template>
                    <template v-slot:right>
                      <slot name="right"></slot>
                    </template>
                </wodin-panels>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent
} from "vue";
import { useStore } from "vuex";
import SessionInitialiseModal from "./SessionInitialiseModal.vue";
import { AppStateAction } from "../store/appState/actions";
import ErrorsAlert from "./ErrorsAlert.vue";
import WodinPanels from "./WodinPanels.vue";
import LoadingSpinner from "./LoadingSpinner.vue";

export default defineComponent({
    name: "WodinApp",
    components: {
        SessionInitialiseModal,
        LoadingSpinner,
        ErrorsAlert,
        WodinPanels
    },
    setup() {
        const store = useStore();

        const appType = computed(() => store.state.appType);
        const loading = computed(() => !store.state.config);

        const sessionInitialised = computed(() => store.state.configured);
        const latestSessionId = computed(() => store.state.sessions.latestSessionId);
        const loadSessionId = computed(() => store.state.loadSessionId);

        const initialise = (sessionId: string, copySession = true) => {
            store.dispatch(AppStateAction.InitialiseSession, { loadSessionId: sessionId, copySession });
        };

        // If there's a load (share) session id, then immediately initialise with that
        // If there is no latest session id then immediately initialise a new session - display modal conditional on
        // this value as well as sessionInitialised to avoid momentary display of modal when this is true.
        const immediateInitialise = computed(() => {
            return !sessionInitialised.value && (loadSessionId.value || !latestSessionId.value);
        });

        if (immediateInitialise.value) {
            initialise(loadSessionId.value || "");
        }

        const newSession = () => {
            initialise("");
        };

        const reloadSession = () => {
            initialise(latestSessionId.value!, false);
        };

        return {
            appType,
            loading,
            sessionInitialised,
            immediateInitialise,
            newSession,
            reloadSession
        };
    }
});
</script>
<style lang="scss">
    @import "src/scss/style";
    .center-of-screen {
        position: fixed;
        top: calc(50% - 100px);
        left: calc(50% - 100px);
    }
</style>
