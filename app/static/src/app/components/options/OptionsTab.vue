<template>
    <div>
        <vertical-collapse title="Model Parameters" collapse-id="model-params">
          <parameter-values></parameter-values>
        </vertical-collapse>
        <vertical-collapse title="Run Options" collapse-id="run-options">
          <run-options></run-options>
        </vertical-collapse>
    </div>
</template>

<script lang="ts">
import VerticalCollapse from "../VerticalCollapse.vue";
import ParameterValues from "./ParameterValues.vue";
import RunOptions from "./RunOptions.vue";

export default {
    name: "OptionsTab",
    components: {
        ParameterValues,
        RunOptions,
        VerticalCollapse
    }
};
</script>
