<template>
    <div>
        <vertical-collapse title="Model Parameters" collapse-id="model-params">
          <parameter-values></parameter-values>
        </vertical-collapse>
    </div>
</template>

<script lang="ts">
import VerticalCollapse from "../VerticalCollapse.vue";
import ParameterValues from "./ParameterValues.vue";

export default {
    name: "OptionsTab",
    components: {
        ParameterValues,
        VerticalCollapse
    }
};
</script>
