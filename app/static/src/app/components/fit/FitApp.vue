<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h1>{{title}}</h1>
                <div id="app-type">App Type: {{appType}}</div>
                <div id="fit-prop">Fit Prop: {{fitProp}}</div>
                <errors-alert></errors-alert>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import { FitAction } from "../../store/fit/actions";
import ErrorsAlert from "../ErrorsAlert.vue";

export default defineComponent({
    props: {
        appName: String,
        title: String
    },
    components: {
        ErrorsAlert
    },
    setup(props) {
        const store = useStore();

        const appType = computed(() => store.state.appType);
        const fitProp = computed(() => store.state.config?.fitProp);

        onMounted(() => {
            store.dispatch(FitAction.FetchConfig, props.appName);
        });

        return {
            appType,
            fitProp
        };
    }
});
</script>
<style lang="scss">
    @import "../../../scss/style.scss";
</style>
