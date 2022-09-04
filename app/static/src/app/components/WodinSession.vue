<template>
  <router-view></router-view>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { RouterView } from "vue-router";
import { useStore } from "vuex";
import { AppStateAction } from "../store/appState/actions";
import { ModelAction } from "../store/model/actions";

export default defineComponent({
    name: "WodinSession",
    props: {
        appName: String,
        loadSessionId: String
    },
    components: {
        RouterView
    },
    setup(props) {
        console.log("load session id: " + props.loadSessionId)
        const store = useStore();
        onMounted(() => {
            const { appName, loadSessionId } = props;
            store.dispatch(AppStateAction.FetchConfig, {appName, loadSessionId});
            store.dispatch(`model/${ModelAction.FetchOdinRunner}`);
        });
    }
});
</script>
