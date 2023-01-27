<template>
  <a data-bs-toggle="collapse"
     :href="`#${collapseId}`"
     role="button"
     :aria-expanded="!collapsed"
     :aria-controls="collapseId"
     @click="toggleCollapse">
    <div class="p-2 clearfix" :class="titleClass">
        {{title}}
        <vue-feather class="collapse-icon" :type="toggleIconType"></vue-feather>
        <vue-feather v-if="icon" class="collapse-icon" :type="icon"></vue-feather>
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
        icon: String,
        collapseId: String,
        initialCollapsed: {
            type: Boolean,
            default: false
        },
        titleClass: {
          type: String,
          default: "collapse-title"
        }
    },
    components: {
        VueFeather
    },
    setup(props) {
        const collapsed = ref(props.initialCollapsed);

        const toggleCollapse = () => {
            collapsed.value = !collapsed.value;
        };

        const toggleIconType = computed(() => (collapsed.value ? "chevron-down" : "chevron-up"));

        return {
            toggleCollapse,
            collapsed,
            toggleIconType
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
