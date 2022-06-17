<template>
  <div class="collapse-title p-2">
    {{title}}
    <a data-bs-toggle="collapse"
       :href="`#${collapseId}`"
       role="button"
       aria-expanded="true"
       :aria-controls="collapseId"
       @click="toggleCollapse">
      <vue-feather :type="iconType"></vue-feather>
    </a>
  </div>
  <div class="collapse show" :id="collapseId">
    <slot></slot>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import "bootstrap";
import VueFeather from "vue-feather";

export default defineComponent({
    name: "VerticalCollapse",
    props: {
        title: String,
        collapseId: String
    },
    components: {
        VueFeather
    },
    setup() {
        const collapsed = ref(false); // default to expanded view

        const toggleCollapse = () => {
            collapsed.value = !collapsed.value;
        };

        const iconType = computed(() => (collapsed.value ? "chevron-down" : "chevron-up"));

        return {
            toggleCollapse,
            iconType
        };
    }
});
</script>

<style scoped lang="scss">
  .collapse-title {
    background-color: #e8ebee;
    font-weight: bold;

    a {
      float: right;
      color: #777;
    }
  }
</style>
