<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h1>{{title}}</h1>
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
import { BasicAction } from "../store/basic/actions";
import ErrorsAlert from "./ErrorsAlert.vue";
import WodinPanels from "./WodinPanels.vue";
import { ModelAction } from "../store/model/actions";
import LoadingSpinner from "./LoadingSpinner.vue";

export default defineComponent({
    name: "WodinApp",
    props: {
        appName: String,
        title: String
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
            store.dispatch(BasicAction.FetchConfig, props.appName); // TODO: This needs to move from Basic
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
