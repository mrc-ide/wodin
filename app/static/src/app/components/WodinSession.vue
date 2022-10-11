<template>
  <router-view v-if="initialised"></router-view>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import { RouterView } from "vue-router";
import { useStore } from "vuex";
import { AppStateAction } from "../store/appState/actions";
import {ErrorsMutation} from "../store/errors/mutations";

export default defineComponent({
    name: "WodinSession",
    props: {
        appName: String,
        loadSessionId: String,
        shareNotFound: String
    },
    components: {
        RouterView
    },
    setup(props) {
        const store = useStore();
        const initialised = computed(() => !!store.state.appName);
        onMounted(() => {
            if (props.shareNotFound) {
                store.commit(`errors/${ErrorsMutation.AddError}`, {detail: `Share id not found: ${props.shareNotFound}`});
            }

            const { appName, loadSessionId } = props;
            store.dispatch(AppStateAction.Initialise, { appName, loadSessionId });
        });

        return { initialised };
    }
});
</script>
