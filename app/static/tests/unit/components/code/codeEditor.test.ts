// Mock the import of monaco loader so we can mock its methods
const { mockMonacoEditor, mockMonaco } = vi.hoisted(() => {
    const mockMonacoEditor = {
        onDidChangeModelContent: vi.fn(),
        getModel: () => {
            return { getLinesContent: vi.fn().mockReturnValueOnce(["new code"]) };
        },
        setValue: vi.fn(),
        deltaDecorations: vi.fn()
    };
    const mockMonaco = {
        editor: {
            create: vi.fn().mockReturnValue(mockMonacoEditor)
        }
    };
    return {
        mockMonacoEditor,
        mockMonaco
    }
});
vi.mock("@monaco-editor/loader", () => {
    return {
        default: { init: async () => mockMonaco }
    };
});

const editorGlyphs: any = {
    error: "fa-solid fa-circle-xmark",
    warning: "fa-solid fa-triangle-exclamation"
};
const monacoLineRange = (line: number, reset = false) => {
    return {
        startLineNumber: line,
        startColumn: reset ? 1 : 0,
        endLineNumber: line,
        endColumn: reset ? 1 : Infinity
    };
};
const monacoOptions = (state: string, message: string) => {
    return {
        className: `editor-${state}-background`,
        glyphMarginClassName: `${editorGlyphs[state]} ${state}-glyph-style ms-1`,
        hoverMessage: { value: message },
        glyphMarginHoverMessage: { value: message }
    };
};
const expectDeltaDecorationInputs = async (line: number, state: string, message: string) => {
    await new Promise(res => setTimeout(res, 700));
    const changeHandler = mockMonacoEditor.onDidChangeModelContent.mock.calls[0][0];
    changeHandler();
    await flushPromises();
    expect(mockMonacoEditor.deltaDecorations.mock.calls[0].at(-1)).toStrictEqual([
        {
            range: monacoLineRange(1, true),
            options: {}
        }
    ]);
    expect(mockMonacoEditor.deltaDecorations.mock.calls[1].at(-1)).toStrictEqual([
        {
            range: monacoLineRange(line),
            options: monacoOptions(state, message)
        }
    ]);
};

import { flushPromises, shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import CodeEditor from "../../../../src/components/code/CodeEditor.vue";
import { BasicState } from "../../../../src/store/basic/state";
import { BasicConfig } from "../../../../src/types/responseTypes";
import { mockBasicState, mockCodeState, mockModelState } from "../../../mocks";
import { nextTick } from "vue";

describe("CodeEditor", () => {
    const mockHelpDirective = vi.fn();
    const getWrapper = (
        readOnlyCode = false,
        mockUpdateCode = vi.fn(),
        defaultCode = ["default code"],
        odinModelResponse = { valid: true }
    ) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({
                config: {
                    defaultCode,
                    readOnlyCode,
                    basicProp: ""
                } as BasicConfig
            }),
            modules: {
                code: {
                    namespaced: true,
                    state: mockCodeState({
                        currentCode: ["line1", "line2"]
                    }),
                    actions: {
                        UpdateCode: mockUpdateCode
                    }
                },
                model: {
                    namespaced: true,
                    state: mockModelState({
                        odinModelResponse
                    })
                }
            }
        });

        return shallowMount(CodeEditor, {
            global: {
                plugins: [store],
                directives: {
                    help: mockHelpDirective
                }
            }
        });
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("initialises Monaco Editor", async () => {
        const wrapper = getWrapper();
        await nextTick();
        const el = wrapper.find("div.editor").element;
        expect(mockMonaco.editor.create.mock.calls[0][0]).toBe(el);
        expect(mockMonaco.editor.create.mock.calls[0][1]).toStrictEqual({
            value: "line1\nline2",
            language: "r",
            minimap: { enabled: false },
            readOnly: false,
            automaticLayout: true,
            glyphMargin: true,
            lineNumbersMinChars: 3
        });
    });

    it("Monaco Editor change handler makes a delayed code update dispatch", async () => {
        const mockUpdateCode = vi.fn();
        getWrapper(false, mockUpdateCode);
        await nextTick();
        expect(mockMonacoEditor.onDidChangeModelContent).toHaveBeenCalled();
        const changeHandler = mockMonacoEditor.onDidChangeModelContent.mock.calls[0][0];

        // Trigger the handler the component has set and check that it invokes the action after 1s -
        // it will get the new code we've mocked above in getLines()
        changeHandler();
        expect(mockUpdateCode).not.toHaveBeenCalled();
        await new Promise(res => setTimeout(res, 700));
        expect(mockUpdateCode).toHaveBeenCalled();
        expect(mockUpdateCode.mock.calls[0][1]).toStrictEqual(["new code"]);
    });

    it("initialises Monaco Editor as readonly if state is configured with readOnlyCode", async () => {
        getWrapper(true);
        await nextTick();
        expect(mockMonaco.editor.create.mock.calls[0][1].readOnly).toBe(true);
    });

    it("uses help directive on reset button", () => {
        const wrapper = getWrapper();
        const reset = wrapper.find("button#reset-btn");
        expect(mockHelpDirective).toHaveBeenCalledTimes(1);
        expect(mockHelpDirective.mock.calls[0][0]).toBe(reset.element);
        expect(mockHelpDirective.mock.calls[0][1].value).toBe("resetCode");
    });

    it("can reset monaco editor", async () => {
        const mockUpdateCode = vi.fn();
        const wrapper = getWrapper(false, mockUpdateCode);
        await nextTick();
        expect(mockMonacoEditor.setValue).not.toHaveBeenCalled();
        wrapper.find("#reset-btn").trigger("click");
        expect(mockMonacoEditor.setValue).toHaveBeenCalled();
        expect(mockMonacoEditor.setValue).toHaveBeenCalledWith("default code");
    });

    it("does not render reset button when no default code and is not readOnly", () => {
        const mockUpdateCode = vi.fn();
        const wrapper = getWrapper(false, mockUpdateCode, []);
        expect(wrapper.find("#reset-btn").exists()).toBe(false);
    });

    it("does not render reset button when is readOnly", () => {
        const mockUpdateCode = vi.fn();
        const wrapper = getWrapper(true, mockUpdateCode);
        expect(wrapper.find("#reset-btn").exists()).toBe(false);
    });

    it("executes deltaDecorations when there is an error", async () => {
        const mockUpdateCode = vi.fn();
        const odinModelResponse = {
            valid: false,
            error: { line: [2], message: "error here" }
        };
        getWrapper(false, mockUpdateCode, ["hey code"], odinModelResponse);
        await expectDeltaDecorationInputs(2, "error", "error here");
    });

    it("no input in deltaDecorations when error lines and messages are empty", async () => {
        const mockUpdateCode = vi.fn();
        const odinModelResponse = {
            valid: false,
            error: {}
        };
        getWrapper(false, mockUpdateCode, ["hey code"], odinModelResponse);
        await nextTick();
        const changeHandler = mockMonacoEditor.onDidChangeModelContent.mock.calls[0][0];
        changeHandler();
        await flushPromises();
        expect(mockMonacoEditor.deltaDecorations.mock.calls[1].at(-1)).toStrictEqual([]);
    });

    it("executes deltaDecorations when there is an warning", async () => {
        const mockUpdateCode = vi.fn();
        const odinModelResponse = {
            valid: true,
            metadata: {
                messages: [{ line: [3], message: "warning here" }]
            }
        };
        getWrapper(false, mockUpdateCode, ["hey code"], odinModelResponse);
        await expectDeltaDecorationInputs(3, "warning", "warning here");
    });

    it("no input in deltaDecorations when warning lines and messages are empty", async () => {
        const mockUpdateCode = vi.fn();
        const odinModelResponse = {
            valid: true,
            metadata: {
                messages: [{ line: [], message: "" }]
            }
        };
        getWrapper(false, mockUpdateCode, ["hey code"], odinModelResponse);
        await nextTick();
        const changeHandler = mockMonacoEditor.onDidChangeModelContent.mock.calls[0][0];
        changeHandler();
        await new Promise(res => setTimeout(res, 700));
        expect(mockMonacoEditor.deltaDecorations.mock.calls[1].at(-1)).toStrictEqual([]);
    });
});
