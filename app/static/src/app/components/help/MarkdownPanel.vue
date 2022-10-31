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
            if (!props.markdown) {
                return "";
            }
            const md = new MarkdownIt().use(MarkdownItMathjax);
            return md.render(props.markdown);
        });

        return {
            rendered
        };
    }
});
</script>
