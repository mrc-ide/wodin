<template>
    <div>
        <vertical-collapse v-if="isFit" title="Link" collapse-id="link-data">
          <link-data></link-data>
        </vertical-collapse>
        <vertical-collapse title="Model Parameters" collapse-id="model-params">
          <parameter-values></parameter-values>
        </vertical-collapse>
        <vertical-collapse title="Run Options" collapse-id="run-options">
          <run-options></run-options>
        </vertical-collapse>
    </div>
</template>

<script lang="ts">
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import VerticalCollapse from "../VerticalCollapse.vue";
import ParameterValues from "./ParameterValues.vue";
import RunOptions from "./RunOptions.vue";
import LinkData from "./LinkData.vue";

export default {
    name: "OptionsTab",
    components: {
        LinkData,
        ParameterValues,
        RunOptions,
        VerticalCollapse
    },
    setup() {
        const store = useStore();
        const isFit = computed(() => store.state.appType === "fit");

        return {
            isFit
        };

    }
};
</script>
