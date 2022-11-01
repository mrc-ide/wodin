<template>
  <div v-html="rendered"></div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import * as MarkdownIt from "markdown-it";
import * as MarkdownItMathjax from "markdown-it-mathjax";
import {useStore} from "vuex";

interface MathJaxWindow {
  MathJax: {
    typeset: () => void
  }
}

export default defineComponent({
    name: "MarkdownPanel",
    props: {
        markdown: String
    },
    setup(props) {
        const store = useStore();

        const appHelpUrl = computed(() => {
          return `${store.state.baseUrl}/help`;
        });

        const rendered = computed(() => {
            // TODO: Move this out of this function
            const mj = MarkdownItMathjax();
            const md = new MarkdownIt().use(mj);
            md.renderer.rules.image = function (tokens, idx, options, env, slf) {
                const token = tokens[idx];
                const attrIdx = token.attrIndex("src");
                const src = token.attrs![attrIdx][1];
                if (src.startsWith("/")) {
                  token.attrs![attrIdx][1] = `${appHelpUrl.value}${src}`;
                }
                return slf.renderToken(tokens, idx, options);
            };

            if (!props.markdown) {
                return "";
            }
            return md.render(props.markdown);
        });

        onMounted(() => {
            (window as unknown as MathJaxWindow).MathJax.typeset();
        });

        return {
            rendered
        };
    }
});
</script>
