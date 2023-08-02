<template>
  <a data-bs-toggle="collapse"
     :href="`#${collapseId}`"
     role="button"
     :aria-expanded="!collapsed"
     :aria-controls="collapseId"
     @click="toggleCollapse">
    <div class="collapse-title p-2">
        {{title}}
        <vue-feather class="collapse-icon" :type="iconType"></vue-feather>
    </div>
  </a>
  <div class="collapse" :class="collapsed ? '' : 'show'" :id="collapseId">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {
    defineComponent, ref, computed
} from "vue";
import "bootstrap";
import VueFeather from "vue-feather";

export default defineComponent({
    name: "VerticalCollapse",
    props: {
        title: String,
        collapseId: String,
        collapsedDefault: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    components: {
        VueFeather
    },
    setup(props) {
        const collapsed = ref(props.collapsedDefault); // default to expanded view

        const toggleCollapse = () => {
            collapsed.value = !collapsed.value;
        };

        const iconType = computed(() => (collapsed.value ? "chevron-down" : "chevron-up"));

        return {
            toggleCollapse,
            collapsed,
            iconType
        };
    }
});
</script>

<style scoped lang="scss">
  a {
    text-decoration: none;

    .collapse-title {
      background-color: #e8ebee;
      font-weight: bold;
      color: #000;

      .collapse-icon {
        float: right;
        color: #777;
      }
    }
  }
</style>
