<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h1>{{title}}</h1>
                <wodin-panels>
                    <template v-slot:left>
                        <div id="app-type">App Type: {{appType}}</div>
                        <div id="basic-prop">Basic Prop: {{basicProp}}</div>
                    </template>
                    <template v-slot:right>
                        <run-model-plot></run-model-plot>
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

export default defineComponent({
    props: {
        appName: String,
        title: String
    },
    components: {
        RunModelPlot,
        ErrorsAlert,
        WodinPanels
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
