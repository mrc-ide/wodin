<template>
    <div>
        <button
            v-if="defaultCodeExists"
            class="btn btn-primary btn-sm mb-2"
            id="reset-btn"
            v-help="'resetCode'"
            @click="resetCode"
        >
            Reset
        </button>
        <div class="editor-container mb-2" style="clear: both">
            <div class="editor" ref="editor"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import { useStore } from "vuex";
import loader from "@monaco-editor/loader";
import * as monaco from "monaco-editor";
import Timeout = NodeJS.Timeout;
import { AppConfig, OdinModelResponse } from "../../types/responseTypes";
import { CodeAction } from "../../store/code/actions";
import { CodeMutation } from "../../store/code/mutations";

interface DecorationOptions {
    range: {
        startLineNumber: number;
        startColumn: number;
        endLineNumber: number;
        endColumn: number;
    };
    options: {
        className: string;
        glyphMarginClassName: string;
        hoverMessage: { value: string };
        glyphMarginHoverMessage: { value: string };
    };
}

enum EditorStates {
    error = "error",
    warning = "warning"
}

type EditorGlyphs = {
    [K in EditorStates]: string;
};

export default defineComponent({
    name: "CodeEditor",

    setup() {
        const store = useStore();

        const editor = ref<null | HTMLElement>(null); // Picks up the element with 'plot' ref in the template
        const oldDecorations = ref<string[]>([]);

        const currentCode = computed(() => store.state.code.currentCode);
        const readOnly = computed(() => (store.state.config as AppConfig).readOnlyCode);
        const defaultCode = computed(() => (store.state.config as AppConfig).defaultCode);
        const defaultCodeExists = computed(() => defaultCode.value && defaultCode.value.length && !readOnly.value);
        const odinModelResponse = computed(() => store.state.model.odinModelResponse as OdinModelResponse);

        let newCode: string[] | null = null;
        let timeoutId: null | Timeout = null;
        let editorInstance: monaco.editor.IStandaloneCodeEditor;

        const editorGlyphs: EditorGlyphs = {
            error: "fa-solid fa-circle-xmark",
            warning: "fa-solid fa-triangle-exclamation"
        };

        const getMonacoRange = (line: number, reset = false) => {
            return {
                startLineNumber: line,
                startColumn: reset ? 1 : 0,
                endLineNumber: line,
                endColumn: reset ? 1 : Infinity
            };
        };
        const getLineDecorationOptions = (state: EditorStates, message: string) => {
            return {
                className: `editor-${state}-background`,
                glyphMarginClassName: `${editorGlyphs[state]} ${state}-glyph-style ms-1`,
                hoverMessage: { value: message },
                glyphMarginHoverMessage: { value: message }
            };
        };
        const getNewDecorations = (lines: number[], state: EditorStates, message: string) => {
            const lineDecorations = lines.map((line) => {
                return {
                    range: getMonacoRange(line),
                    options: getLineDecorationOptions(state, message)
                };
            });
            return lineDecorations;
        };

        const resetDecorations = () => {
            oldDecorations.value = editorInstance.deltaDecorations(oldDecorations.value, [
                {
                    range: getMonacoRange(1, true),
                    options: {}
                }
            ]);
        };

        const updateDecorations = () => {
            let newDecorations: DecorationOptions[] = [];
            resetDecorations();
            if (odinModelResponse.value?.error) {
                const newErrors = odinModelResponse.value.error.line || [];
                const errorMessage = odinModelResponse.value.error.message || "";
                newDecorations = getNewDecorations(newErrors, EditorStates.error, errorMessage);
            }
            if (odinModelResponse.value.metadata?.messages) {
                const { messages } = odinModelResponse.value.metadata;
                messages.forEach((message) => {
                    const newWarnings = message.line || [];
                    const warningMessage = message.message || "";
                    newDecorations.push(...getNewDecorations(newWarnings, EditorStates.warning, warningMessage));
                });
            }

            /*
            deltaDecorations takes in an array of strings (ids of decorations already created) which it will
            delete and an array of new decorations (which need a range and options to determine how they
            will look) to create.

            It will return an array of ids of the new decorations it has created (which we keep track of with
            the oldDecorations ref). These ids are generated randomly everytime it creates a decoration so
            there is no pattern!

            deltaDecorations does not delete decorations on update so before adding new decorations we have
            to delete the old ones first (resetDecorations function replaces all decorations with an empty
            decoration)
            */
            oldDecorations.value = editorInstance.deltaDecorations(oldDecorations.value, newDecorations);
            store.commit(`code/${CodeMutation.SetLoading}`, false);
        };

        const updateCode = () => {
            store.dispatch(`code/${CodeAction.UpdateCode}`, newCode, { root: true }).then(updateDecorations);
        };

        const setPendingCodeUpdate = () => {
            store.commit(`code/${CodeMutation.SetLoading}`, true);
            if (!timeoutId) {
                timeoutId = setTimeout(() => {
                    updateCode();
                    timeoutId = null;
                }, 700);
            }
        };

        const createMonacoEditor = () => {
            loader.init().then((monacoInstance) => {
                editorInstance = monacoInstance.editor.create(editor.value as HTMLElement, {
                    value: currentCode.value.join("\n"),
                    language: "r",
                    minimap: { enabled: false },
                    readOnly: readOnly.value,
                    automaticLayout: true,
                    glyphMargin: true,
                    lineNumbersMinChars: 3 // so glyph margin isn't huge
                });

                editorInstance.onDidChangeModelContent(() => {
                    newCode = editorInstance.getModel()!.getLinesContent();
                    setPendingCodeUpdate();
                });

                updateDecorations();
            });
        };

        const resetCode = () => {
            editorInstance.setValue(defaultCode.value.join("\n"));
        };

        onMounted(() => {
            createMonacoEditor();
        });

        return {
            editor,
            readOnly,
            resetCode,
            defaultCodeExists
        };
    }
});
</script>
<style scoped lang="scss">
.editor-container {
    width: 100%;
    border: 1px solid #dee2e6;
}

.editor {
    width: 100%;
    height: 400px;
}
</style>
