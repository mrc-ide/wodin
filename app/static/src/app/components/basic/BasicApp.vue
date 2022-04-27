<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h1>{{title}}</h1>
                <wodin-panels>
                    <template v-slot:left>
                        <tabs :tabNames="['Code', 'Options']">
                            <template v-slot:Code>
                                <odin-code></odin-code>
                            </template>
                            <template v-slot:Options>
                                <options></options>
                            </template>
                        </tabs>
                    </template>
                    <template v-slot:right>
                        <tabs :tabNames="['Run', 'Sensitivity']">
                            <template v-slot:Run>
                                <run-model-plot></run-model-plot>
                            </template>
                            <template v-slot:Sensitivity>
                                <sensitivity></sensitivity>
                            </template>
                        </tabs>
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
import RunModelPlot from "../run/RunModelPlot.vue";
import ErrorsAlert from "../ErrorsAlert.vue";
import WodinPanels from "../WodinPanels.vue";
import { ModelAction } from "../../store/model/actions";
import Tabs from "../Tabs.vue";
import OdinCode from "../code/OdinCode.vue";
import Options from "../options/Options.vue";
import Sensitivity from "../sensitivity/Sensitivity.vue";

export default defineComponent({
    props: {
        appName: String,
        title: String
    },
    components: {
        RunModelPlot,
        ErrorsAlert,
        WodinPanels,
        Tabs,
        OdinCode,
        Options,
        Sensitivity
    },
    setup(props) {
        const store = useStore();

        const appType = computed(() => store.state.appType);
        const basicProp = computed(() => store.state.config?.basicProp);

        onMounted(() => {
            store.dispatch(BasicAction.FetchConfig, props.appName);
            store.dispatch(`model/${ModelAction.FetchOdinRunner}`);
            store.dispatch(`model/${ModelAction.FetchOdin}`); // Test model - not providing odin code yet
        });

        return {
            appType,
            basicProp
        };
    }
});
</script>
<style lang="scss">
    @import "../../../scss/style.scss";
</style>
