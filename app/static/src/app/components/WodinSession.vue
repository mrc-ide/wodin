<template>
  <router-view v-if="initialised"></router-view>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import { RouterView } from "vue-router";
import { useStore } from "vuex";
import { AppStateAction } from "../store/appState/actions";
import { ModelAction } from "../store/model/actions";

export default defineComponent({
    name: "WodinSession",
    props: {
        appName: String
    },
    components: {
        RouterView
    },
    setup(props) {
        const store = useStore();
        const initialised = computed(() => !!store.state.appName);
        onMounted(() => {
            store.dispatch(AppStateAction.FetchConfig, props.appName);
            store.dispatch(`model/${ModelAction.FetchOdinRunner}`);
        });

        return { initialised };
    }
});
</script>
