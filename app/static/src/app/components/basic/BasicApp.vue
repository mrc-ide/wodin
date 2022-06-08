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
                        <wodin-tabs id="left-tabs" :tabNames="['Code', 'Options']">
                            <template v-slot:Code>
                                <code-tab></code-tab>
                            </template>
                            <template v-slot:Options>
                                <options-tab></options-tab>
                            </template>
                        </wodin-tabs>
                    </template>
                    <template v-slot:right>
                        <wodin-tabs id="right-tabs" :tabNames="['Run', 'Sensitivity']">
                            <template v-slot:Run>
                              <run-tab></run-tab>
                            </template>
                            <template v-slot:Sensitivity>
                                <sensitivity-tab></sensitivity-tab>
                            </template>
                        </wodin-tabs>
                        <errors-alert></errors-alert>
                    </template>
                </wodin-panels>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import { BasicAction } from "../../store/basic/actions";
import RunTab from "../run/RunTab.vue";
import ErrorsAlert from "../ErrorsAlert.vue";
import WodinPanels from "../WodinPanels.vue";
import { ModelAction } from "../../store/model/actions";
import LoadingSpinner from "../LoadingSpinner.vue";
import WodinTabs from "../WodinTabs.vue";
import CodeTab from "../code/CodeTab.vue";
import OptionsTab from "../options/OptionsTab.vue";
import SensitivityTab from "../sensitivity/SensitivityTab.vue";

export default defineComponent({
    props: {
        appName: String,
        title: String
    },
    components: {
        LoadingSpinner,
        RunTab,
        ErrorsAlert,
        WodinPanels,
        WodinTabs,
        CodeTab,
        OptionsTab,
        SensitivityTab
    },
    setup(props) {
        const store = useStore();

        const appType = computed(() => store.state.appType);
        const loading = computed(() => !store.state.config);

        onMounted(async () => {
            store.dispatch(BasicAction.FetchConfig, props.appName);
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
    @import "../../../scss/style.scss";
</style>
