<template>
  <div v-html="rendered"></div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import * as MarkdownIt from "markdown-it";
import * as MarkdownItMathjax from "markdown-it-mathjax";

export default defineComponent({
    name: "MarkdownPanel",
    props: {
        markdown: String
    },
    setup(props) {
       const rendered = computed(() => {
            const mj = MarkdownItMathjax();
            const md = new MarkdownIt().use(mj);
            if (!props.markdown) {
                return "";
            }
            return md.render(props.markdown);
        });

        return {
            rendered
        };
    }
});
</script>
