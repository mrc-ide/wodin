<template>
    <div>
        <button v-if="defaultCodeExists"
                class="btn btn-primary btn-sm mb-2"
                id="reset-btn"
                @click="resetCode">Reset
        </button>
        <div class="editor-container mb-2">
            <div class="editor" ref="editor"></div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, onMounted, ref
} from "vue";
import { useStore } from "vuex";
import loader from "@monaco-editor/loader";
import * as monaco from "monaco-editor";
import Timeout = NodeJS.Timeout;
import { AppConfig, OdinModelResponse } from "../../types/responseTypes";
import { CodeAction } from "../../store/code/actions";

export default defineComponent({
    name: "CodeEditor",

    setup() {
        const store = useStore();

        const editor = ref<null | HTMLElement>(null); // Picks up the element with 'plot' ref in the template
        const oldDecorations = ref<string[]>([]);

        const currentCode = computed(() => store.state.code.currentCode);
        const readOnly = computed(() => (store.state.config as AppConfig).readOnlyCode);
        const defaultCode = computed(() => (store.state.config as AppConfig).defaultCode);
        const defaultCodeExists = computed(() => defaultCode.value && (defaultCode.value.length && !readOnly.value));
        const odinModelResponse = computed(() => store.state.model.odinModelResponse as OdinModelResponse);

        let newCode: string[] | null = null;
        let timeoutId: null | Timeout = null;
        let editorInstance: monaco.editor.IStandaloneCodeEditor;

        const getMonacoRange = (line: number, reset = false) => {
            return {
                startLineNumber: line,
                startColumn: reset ? 1 : 0,
                endLineNumber: line,
                endColumn: reset ? 1 : Infinity
            };
        };

        type EditorStates = "error" | "warning"

        type EditorGlyphs = {
            [K in EditorStates]: string
        }

        const editorGlyphs: EditorGlyphs = {
            error: "fa-solid fa-circle-xmark",
            warning: "fa-solid fa-triangle-exclamation"
        };

        const getEditorOptions = (state: EditorStates, message: string) => {
            return {
                className: `editor-${state}-background`,
                glyphMarginClassName: `${editorGlyphs[state]} ${state}-glyph-style ms-1`,
                hoverMessage: { value: message },
                glyphMarginHoverMessage: { value: message }
            };
        };
        const getNewDecorations = (lines: number[], state: EditorStates, message: string) => {
            const errorLineDecorations = lines.map((line) => {
                return {
                    range: getMonacoRange(line),
                    options: getEditorOptions(state, message)
                };
            });
            return errorLineDecorations;
        };
        const applyDecorations = (lines: number[], state: EditorStates, message: string, decorations: string[]) => {
            let decors = decorations;
            decors = editorInstance.deltaDecorations(decors, getNewDecorations(lines, state, message));
            oldDecorations.value = decors;
        };
        const resetDecorations = (decorations: string[]) => {
            editorInstance.deltaDecorations(decorations, [{ range: getMonacoRange(1, true), options: {} }]);
        };

        const updateCode = () => {
            store.dispatch(`code/${CodeAction.UpdateCode}`, newCode, { root: true })
                .then(() => {
                    resetDecorations(oldDecorations.value);
                })
                .then(() => {
                    if (odinModelResponse.value.error) {
                        const newErrors = odinModelResponse.value.error.line || [];
                        const message = odinModelResponse.value.error.message || "";
                        applyDecorations(newErrors, "error", message, oldDecorations.value);
                    }
                    if (odinModelResponse.value.metadata?.messages) {
                        const { messages } = odinModelResponse.value.metadata;
                        messages.forEach((message) => {
                            const warningLine = message.line || [];
                            const warningMessage = message.message || "";
                            applyDecorations(warningLine, "warning", warningMessage, oldDecorations.value);
                        });
                    }
                });
        };

        const setPendingCodeUpdate = () => {
            if (!timeoutId) {
                timeoutId = setTimeout(() => {
                    updateCode();
                    timeoutId = null;
                }, 700); // 1 second felt too long
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
