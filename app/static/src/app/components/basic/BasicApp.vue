<template>
    <div>
        <h1>{{title}}</h1>
        <div id="app-type">App Type: {{appType}}</div>
        <div id="basic-prop">Basic Prop: {{basicProp}}</div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import {BasicAction} from "../../store/basic/actions";

interface Props {
    app: string
}

export default defineComponent({
    props: {
        appName: String
    },
    setup(props) {
        const store = useStore();

        const title = computed(() => store.state.title); //TODO: this should come from config or a prop
        const appType = computed(() => store.state.appType);
        const basicProp = computed(() => store.state.config?.basicProp);

        onMounted(() => {
            store.dispatch(BasicAction.FetchConfig, props.appName);
        });

        return {
            title,
            appType,
            basicProp
        };
    }
});
</script>
<style lang="scss">
    @import "../../../scss/style.scss";
</style>
