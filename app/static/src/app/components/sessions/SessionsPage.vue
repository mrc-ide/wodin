<template>
  <div class="container">
    <div class="row">
      <h2>Sessions</h2>
      <div> Coming soon - Sessions list!</div>
    </div>
  </div>
</template>

<script>
import {onMounted, defineComponent} from "vue";
import {useStore} from "vuex";
import {SessionsAction} from "@/app/store/sessions/actions";

export default defineComponent({
    name: "SessionsPage",
    setup() {
      const store = useStore();
      onMounted(() => {
        store.dispatch(`sessions/${SessionsAction.GetSessions}`);
      });
    }
});
</script>

<style scoped>
  .container {
    max-width: 1140px;
  }
</style>
