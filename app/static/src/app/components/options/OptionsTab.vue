<template>
    <div>
        <vertical-collapse title="Model Parameters" collapse-id="model-params">
          <div>Param1: Value 1</div>
          <div>Param2: Value 2</div>
          <div>Param3: Value 3</div>
        </vertical-collapse>
    </div>
</template>

<script lang="ts">
import VerticalCollapse from "../VerticalCollapse.vue";

export default {
    name: "OptionsTab",
    components: {
        VerticalCollapse
    }
};
</script>
