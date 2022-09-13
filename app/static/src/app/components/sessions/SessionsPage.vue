<template>
  <div class="container">
    <div class="row">
      <h2>Sessions</h2>
    </div>
    <template v-if="sessionsMetadata">
      <div class="row fw-bold py-2">
        <div class="col-3">Saved</div>
        <div class="col-2">Label</div>
        <div class="col-2 text-center">Load</div>
      </div>
      <div class="row py-2" v-for="session in sessionsMetadata">
        <div class="col-3">{{formatDateTime(session.time)}}</div>
        <div class="col-2" :class="session.label ? '' : 'text-muted'">{{session.label || "--no label--"}}</div>
        <div class="col-2 text-center">
          <a :href="sessionUrl(session.id)">
            <vue-feather class="inline-icon brand" type="upload"></vue-feather>
          </a>
        </div>
      </div>
    </template>
    <div v-else>
      Loading sessions...
    </div>
  </div>
</template>

<script lang="ts">
import {utc} from "moment";
import {onMounted, defineComponent, computed} from "vue";
import {useStore} from "vuex";
import VueFeather from "vue-feather"
import {SessionsAction} from "../../store/sessions/actions";

export default defineComponent({
    name: "SessionsPage",
    components: {
      VueFeather
    },
    setup() {
      const store = useStore();

      const sessionsMetadata = computed(() => store.state.sessions.sessionsMetadata);
      const appName = computed(() => store.state.appName);

      const formatDateTime = (isoUTCString: string) => {
        return utc(isoUTCString).local().format('DD/MM/YYYY HH:mm:ss');
      };

      const sessionUrl = (sessionId: string) => `/apps/${appName.value}/sessions/${sessionId}`;

      onMounted(() => {
        store.dispatch(`sessions/${SessionsAction.GetSessions}`);
      });

      return {
        sessionsMetadata,
        formatDateTime,
        sessionUrl
      }
    }
});
</script>

<style scoped>
  .container {
    max-width: 1140px;
  }
</style>
