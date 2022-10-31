<template>
  <router-view v-if="initialised"></router-view>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import { RouterView } from "vue-router";
import { useStore } from "vuex";
import { AppStateAction } from "../store/appState/actions";
import { ErrorsMutation } from "../store/errors/mutations";

export default defineComponent({
    name: "WodinSession",
    props: {
        appName: String,
        baseUrl: String,
        appsPath: String,
        loadSessionId: String,
        shareNotFound: String
    },
    components: {
        RouterView
    },
    setup(props) {
        const store = useStore();
        const initialised = computed(() => !!(store.state.appName && store.state.baseUrl));
        onMounted(() => {
            if (props.shareNotFound) {
                store.commit(`errors/${ErrorsMutation.AddError}`,
                    { detail: `Share id not found: ${props.shareNotFound}` });
            }
            const {
                appName,
                baseUrl,
                loadSessionId,
                appsPath
            } = props;
            store.dispatch(AppStateAction.Initialise,
                {
                    appName,
                    baseUrl,
                    loadSessionId,
                    appsPath
                });
        });

        return { initialised };
    }
});
</script>
