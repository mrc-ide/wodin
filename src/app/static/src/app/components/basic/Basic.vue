<template>
    <div>
        <h1>{{title}}</h1>
        <div>App Type: {{appType}}</div>
        <div>Basic Prop: {{basicProp}}</div>
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
            const basicProp = computed(() => store.state.basicProp);

            return {
                title,
                appType,
                basicProp
            }
        }
    }
</script>
<style lang="scss">
    @import "../../../../node_modules/bootstrap/scss/bootstrap.scss";
    @import "../../../../node_modules/bootstrap-vue/src/index.scss";
</style>
