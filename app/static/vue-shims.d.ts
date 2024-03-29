// src/vue-shims.d.ts
declare module "*.vue" {
    import Vue from "vue";
    export default Vue;
}

declare module "vue/dist/vue.esm-bundler";
declare module "vue-monaco";
declare module "csv-parse";
declare module "markdown-it-mathjax";
declare module "raw-loader!*";
declare module "vue3-tags-input";
