<template>
    <div>
        <h1>{{title}}</h1>
        <div id="app-type">App Type: {{appType}}</div>
        <div id="fit-prop">Model Fit Prop: {{fitProp}}</div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
    setup() {
        const store = useStore();

        const title = computed(() => store.state.title);
        const appType = computed(() => store.state.appType);
        const fitProp = computed(() => store.state.fitProp);

        return {
            title,
            appType,
            fitProp
        };
    }
});
</script>
<style lang="scss">
    @import "../../../scss/style.scss";
</style>
