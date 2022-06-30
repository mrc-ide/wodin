<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div v-if="loading" class="text-center">
                  <loading-spinner size="lg"></loading-spinner>
                  <h2 id="loading-message">Loading application...</h2>
                </div>
                <wodin-panels v-if="!loading" >
                    <template v-slot:left>
                      <slot name="left"></slot>
                    </template>
                    <template v-slot:right>
                      <slot name="right"></slot>
                    </template>
                </wodin-panels>
                <errors-alert></errors-alert>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import ErrorsAlert from "./ErrorsAlert.vue";
import WodinPanels from "./WodinPanels.vue";
import { ModelAction } from "../store/model/actions";
import LoadingSpinner from "./LoadingSpinner.vue";
import { AppStateAction } from "../store/appState/actions";

export default defineComponent({
    name: "WodinApp",
    props: {
        appName: String
    },
    components: {
        LoadingSpinner,
        ErrorsAlert,
        WodinPanels
    },
    setup(props) {
        const store = useStore();

        const appType = computed(() => store.state.appType);
        const loading = computed(() => !store.state.config);

        onMounted(() => {
            store.dispatch(AppStateAction.FetchConfig, props.appName);
            store.dispatch(`model/${ModelAction.FetchOdinRunner}`);
        });

        return {
            appType,
            loading
        };
    }
});
</script>
<style lang="scss">
    @import "src/scss/style";
</style>