<template>
    <div>
        <h1>{{title}}</h1>
        <div id="app-type">App Type: {{appType}}</div>
        <div id="stochastic-prop">Stochastic Prop: {{stochasticProp}}</div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
    setup() {
        const store = useStore();

        const title = computed((): string => store.state.title);
        const appType = computed((): string => store.state.appType);
        const stochasticProp = computed((): string => store.state.stochasticProp);

        return {
            title,
            appType,
            stochasticProp
        };
    }
});
</script>
<style lang="scss">
    @import "../../../scss/style.scss";
</style>
