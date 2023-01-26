<template>
  <vertical-collapse title="?">
    {{markdown}}
  </vertical-collapse>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import VerticalCollapse from "../VerticalCollapse.vue";

export default defineComponent({
    name: "GenericHelp",
  components: {VerticalCollapse},
    props: {
      markdown: String
    }
});
</script>
