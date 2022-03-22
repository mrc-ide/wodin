<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h1>{{title}}</h1>
                <div id="app-type">App Type: {{appType}}</div>
                <div id="stochastic-prop">Stochastic Prop: {{stochasticProp}}</div>
                <errors-alert></errors-alert>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import { StochasticAction } from "../../store/stochastic/actions";
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
        const stochasticProp = computed(() => store.state.config?.stochasticProp);

        onMounted(() => {
            store.dispatch(StochasticAction.FetchConfig, props.appName);
        });

        return {
            appType,
            stochasticProp
        };
    }
});
</script>
<style lang="scss">
    @import "../../../scss/style.scss";
</style>
