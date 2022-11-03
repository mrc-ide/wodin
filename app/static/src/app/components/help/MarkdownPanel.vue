<template>
  <div v-html="rendered"></div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import * as MarkdownIt from "markdown-it";
import * as MarkdownItMathjax from "markdown-it-mathjax";
import { useStore } from "vuex";

interface MathJaxWindow {
  MathJax: {
    typeset: () => void
  }
}

export default defineComponent({
    name: "MarkdownPanel",
    props: {
        markdown: Array
    },
    setup(props) {
        const store = useStore();

        const appHelpUrl = computed(() => {
            return `${store.state.baseUrl}/help`;
        });

        const isAbsoluteUrl = (s: string) => {
            return /^(http:\/\/|https:\/\/)/.test(s);
        };

        const mathjaxPlugin = MarkdownItMathjax();
        const markdownIt = new MarkdownIt().use(mathjaxPlugin);
        // Adapt default rendering to fetch images from base help url
        markdownIt.renderer.rules.image = function (tokens, idx, options, env, slf) {
            const token = tokens[idx];
            const attrIdx = token.attrIndex("src");
            const src = token.attrs![attrIdx][1];
            if (!isAbsoluteUrl(src)) {
              token.attrs![attrIdx][1] = `${appHelpUrl.value}/${src}`;
            }
            return slf.renderToken(tokens, idx, options);
        };

        const rendered = computed(() => {
            if (!props.markdown?.length) {
                return "";
            }
            const joined = props.markdown.join("\n");
            return markdownIt.render(joined);
        });

        onMounted(() => {
            const mathjax = (window as unknown as MathJaxWindow).MathJax;
            if (mathjax) {
                mathjax.typeset();
            }
        });

        return {
            rendered
        };
    }
});
</script>
