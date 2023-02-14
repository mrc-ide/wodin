<template>
    <div v-if="appIsConfigured" class="code-tab">
        <generic-help title="Write odin code" :markdown="codeHelp"></generic-help>
        <code-editor/>
        <button class="btn btn-primary mt-2" id="compile-btn" :disabled="!codeIsValid" @click="compile">Compile</button>
        <div class="mt-2" id="code-status">
            <vue-feather class="inline-icon" :class="iconClass" :type="validIcon"></vue-feather>
            {{ validMsg }}
        </div>
        <error-info :error="error"></error-info>
        <vertical-collapse v-if="showSelectedVariables"
                           title="Select variables"
                           collapse-id="select-variables"
                           class="mt-3">
          <selected-variables></selected-variables>
        </vertical-collapse>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import VueFeather from "vue-feather";
// eslint-disable-next-line import/no-webpack-loader-syntax
import codeHelp from "raw-loader!../../help/code.md";
import CodeEditor from "./CodeEditor.vue";
import { ModelAction } from "../../store/model/actions";
import userMessages from "../../userMessages";
import ErrorInfo from "../ErrorInfo.vue";
import SelectedVariables from "./SelectedVariables.vue";
import VerticalCollapse from "../VerticalCollapse.vue";
import GenericHelp from "../help/GenericHelp.vue";

export default defineComponent({
    name: "CodeTab",
    components: {
        GenericHelp,
        SelectedVariables,
        ErrorInfo,
        CodeEditor,
        VueFeather,
        VerticalCollapse
    },
    setup() {
        const store = useStore();
        const codeIsValid = computed(() => store.state.model.odinModelResponse?.valid);
        const error = computed(() => store.state.model.odinModelCodeError);
        const validMsg = computed(() => (codeIsValid.value ? userMessages.code.isValid : userMessages.code.isNotValid));
        const validIcon = computed(() => (codeIsValid.value ? "check" : "x"));
        const iconClass = computed(() => (codeIsValid.value ? "text-success" : "text-danger"));
        const allVariables = computed<string[]>(() => store.state.model.odinModelResponse?.metadata?.variables || []);
        const showSelectedVariables = computed(() => allVariables.value.length && !store.state.model.compileRequired);
        const appIsConfigured = computed(() => store.state.configured);
        const compile = () => store.dispatch(`model/${ModelAction.CompileModel}`);

        return {
            appIsConfigured,
            codeIsValid,
            validMsg,
            validIcon,
            iconClass,
            compile,
            error,
            showSelectedVariables,
            codeHelp
        };
    }
});
</script>
