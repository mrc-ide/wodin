<template>
  markdown panel
  <div class="markdown-panel" v-html="rendered"></div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import MarkdownItMathjax from "markdown-it-mathjax";
import { useStore } from "vuex";
import MarkdownIt from "./MarkdownItImport";

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

        const rendered = computed(() => {
            console.log(`type: ${typeof MarkdownItMathjax}`);
            console.log(JSON.stringify(MarkdownItMathjax));
            console.log(`type: ${typeof MarkdownIt}`);
            console.log(JSON.stringify(MarkdownIt));
            const mathjaxPlugin = MarkdownItMathjax();
            const markdownIt = new MarkdownIt().use(mathjaxPlugin);
            // Adapt default rendering to fetch images from base help url
            markdownIt.renderer.rules.image = function (tokens: any, idx: any, options: any, env: any, slf: any) {
                const token = tokens[idx];
                const attrIdx = token.attrIndex("src");
                const src = token.attrs![attrIdx][1];
                if (!isAbsoluteUrl(src)) {
                token.attrs![attrIdx][1] = `${appHelpUrl.value}/${src}`;
                }
                return slf.renderToken(tokens, idx, options);
            };

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
