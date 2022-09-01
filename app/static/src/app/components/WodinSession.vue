<template>
  <router-link to="/sessions">Sessions</router-link> <br/>
  <router-view></router-view>
</template>

<script lang="ts">
import {defineComponent, onMounted} from "vue";
import {RouterView, RouterLink} from "vue-router";
import {useStore} from "vuex";
import {AppStateAction} from "../store/appState/actions";
import {ModelAction} from "../store/model/actions";

export default defineComponent({
  name: "WodinSession.vue",
  props: {
    appName: String
  },
  components: {
    RouterView,
    RouterLink
  },
  setup(props) {
    const store = useStore();
    onMounted(() => {
      store.dispatch(AppStateAction.FetchConfig, props.appName);
      store.dispatch(`model/${ModelAction.FetchOdinRunner}`);
    });
  }
});
</script>
