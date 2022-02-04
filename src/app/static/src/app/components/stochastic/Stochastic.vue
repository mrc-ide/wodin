<template>
    <div>
        <h1>{{title}}</h1>
        <div id="app-type">App Type: {{appType}}</div>
        <div id="stochastic-prop">Stochastic Prop: {{stochasticProp}}</div>
    </div>
</template>

<script lang="ts">
    import { computed } from "vue";
    import { useStore } from "vuex";

    export default {
        setup() {
            const store = useStore();

            const title = computed(() => store.state.title);
            const appType = computed(() => store.state.appType);
            const stochasticProp = computed(() => store.state.stochasticProp);

            return {
                title,
                appType,
                stochasticProp
            }
        }
    }
</script>
<style lang="scss">
    @import "../../../scss/style.scss";
</style>
