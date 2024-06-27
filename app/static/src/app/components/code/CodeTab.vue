<template>
    <div v-if="appIsConfigured" class="code-tab">
        <generic-help title="Write odin code" :markdown="codeHelp"></generic-help>
        <code-editor />
        <button class="btn btn-primary mt-2" id="compile-btn" :disabled="!codeIsValid" @click="compile">Compile</button>
        <div class="mt-2" id="code-status" :class="codeValidating ? 'code-validating-text' : ''">
            <vue-feather
                class="inline-icon me-1"
                :class="iconClass"
                :type="validIcon"
                :size="20"
                :stroke-width="4"
            ></vue-feather>
            {{ validMsg }}
        </div>
        <error-info :error="error"></error-info>
        <div class="mt-3">
            <vertical-collapse v-if="showSelectedVariables" title="Select variables" collapse-id="select-variables">
                <div class="ms-2">
                    Drag variables to move to another graph, or to hide variable.
                </div>
                <selected-variables
                    v-for="(_, index) in graphsConfig"
                    :graph-index="index"
                    :key="index"
                    :dragging="draggingVariable"
                    @setDragging="setDraggingVariable"
                ></selected-variables>
                <hidden-variables
                    @setDragging="setDraggingVariable"
                    :dragging="draggingVariable"
                    style="clear: both"
                ></hidden-variables>
                <button class="btn btn-primary mt-2 float-end" id="add-graph-btn" @click="addGraph">Add Graph</button>
            </vertical-collapse>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useStore } from "vuex";
import VueFeather from "vue-feather";
// eslint-disable-next-line import/no-webpack-loader-syntax
import codeHelp from "raw-loader!../../help/code.md";
import CodeEditor from "./CodeEditor.vue";
import { ModelAction } from "../../store/model/actions";
import userMessages from "../../userMessages";
import ErrorInfo from "../ErrorInfo.vue";
import SelectedVariables from "./SelectedVariables.vue";
import HiddenVariables from "./HiddenVariables.vue";
import VerticalCollapse from "../VerticalCollapse.vue";
import GenericHelp from "../help/GenericHelp.vue";
import { GraphsAction } from "../../store/graphs/actions";

export default defineComponent({
    name: "CodeTab",
    components: {
        GenericHelp,
        SelectedVariables,
        HiddenVariables,
        ErrorInfo,
        CodeEditor,
        VueFeather,
        VerticalCollapse
    },
    setup() {
        // TODO: move all graphs stuff into another component
        const draggingVariable = ref(false); // indicates whether a child component is dragging a variable
        const store = useStore();
        const codeIsValid = computed(() => store.state.model.odinModelResponse?.valid);
        const codeValidating = computed(() => store.state.code.loading);
        const error = computed(() => store.state.model.odinModelCodeError);
        const validMsg = computed(() => (codeIsValid.value ? userMessages.code.isValid : userMessages.code.isNotValid));
        const validIcon = computed(() => (codeIsValid.value ? "check" : "x"));
        const iconValidatedClass = computed(() => (codeIsValid.value ? "text-success" : "text-danger"));
        const iconClass = computed(() => (codeValidating.value ? "code-validating-icon" : iconValidatedClass.value));
        const allVariables = computed<string[]>(() => store.state.model.odinModelResponse?.metadata?.variables || []);
        const showSelectedVariables = computed(() => allVariables.value.length && !store.state.model.compileRequired);
        const appIsConfigured = computed(() => store.state.configured);
        const graphsConfig = computed(() => store.state.graphs.config);
        const compile = () => store.dispatch(`model/${ModelAction.CompileModel}`);
        const addGraph = () => {
            store.dispatch(`graphs/${GraphsAction.NewGraph}`);
        };
        const loadingMessage = userMessages.code.isValidating;
        const setDraggingVariable = (value: boolean) => (draggingVariable.value = value);

        return {
            appIsConfigured,
            codeIsValid,
            validMsg,
            validIcon,
            iconClass,
            compile,
            error,
            showSelectedVariables,
            codeHelp,
            codeValidating,
            loadingMessage,
            graphsConfig,
            addGraph,
            draggingVariable,
            setDraggingVariable
        };
    }
});
</script>
<style>
.code-validating-icon {
    color: gray;
}
.code-validating-text {
    color: rgba(0, 0, 0, 0.7);
}
</style>
