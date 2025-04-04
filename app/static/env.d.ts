/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STATIC_BUILD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "vuex" {
  export * from "vuex/types/index.d.ts";
  export * from "vuex/types/helpers.d.ts";
  export * from "vuex/types/logger.d.ts";
  export * from "vuex/types/vue.d.ts";
}

declare module 'vue3-tags-input';
declare module 'markdown-it-mathjax';
declare module 'markdown-it/lib/token';
declare module 'markdown-it/lib/renderer';
declare module 'vue-feather';
