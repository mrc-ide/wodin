<template>
    <div class="code-tab">
        <code-editor/>
        <button class="btn btn-primary mt-2" id="compile-btn" :disabled="!codeIsValid" @click="compile">Compile</button>
        <div class="mt-2" id="code-status">
            <vue-feather class="inline-icon" :class="iconClass" :type="validIcon"></vue-feather>
            {{ validMsg }}
        </div>
        <error-info :error="error"></error-info>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import VueFeather from "vue-feather";
import CodeEditor from "./CodeEditor.vue";
import { ModelAction } from "../../store/model/actions";
import userMessages from "../../userMessages";
import ErrorInfo from "../ErrorInfo.vue";

export default defineComponent({
    name: "CodeTab",
    components: {
        ErrorInfo,
        CodeEditor,
        VueFeather
    },
    setup() {
        const store = useStore();
        const codeIsValid = computed(() => store.state.model.odinModelResponse?.valid);
        const error = computed(() => store.state.model.odinModelResponseError);
        const validMsg = computed(() => (codeIsValid.value ? userMessages.code.isValid : userMessages.code.isNotValid));
        const validIcon = computed(() => (codeIsValid.value ? "check" : "x"));
        const iconClass = computed(() => (codeIsValid.value ? "text-success" : "text-danger"));
        const compile = () => store.dispatch(`model/${ModelAction.CompileModel}`);

        return {
            codeIsValid,
            validMsg,
            validIcon,
            iconClass,
            compile,
            error
        };
    }
});
</script>
