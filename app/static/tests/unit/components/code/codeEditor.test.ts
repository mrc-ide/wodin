// Mock the import of monaco loader so we can mock its methods
const mockMonacoEditor = {
    onDidChangeModelContent: jest.fn(),
    getModel: () => {
        return { getLinesContent: jest.fn().mockReturnValueOnce(["new code"]) };
    },
    setValue: jest.fn(),
    deltaDecorations: jest.fn()
};
const mockMonaco = {
    editor: {
        create: jest.fn().mockReturnValue(mockMonacoEditor)
    }
};
jest.mock("@monaco-editor/loader", () => {
    return { init: async () => mockMonaco };
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
const expectDeltaDecorationInputs = (line: number, state: string, message: string, done: jest.DoneCallback) => {
    setTimeout(() => {
        const changeHandler = mockMonacoEditor.onDidChangeModelContent.mock.calls[0][0];
        changeHandler();
        setTimeout(() => {
            // 1 for resetting all decorations and 1 for adding state decorations
            // x2 (these trigger on mount too)
            expect(mockMonacoEditor.deltaDecorations).toHaveBeenCalledTimes(4);
            expect(mockMonacoEditor.deltaDecorations.mock.calls[0][1]).toStrictEqual([{
                range: monacoLineRange(1, true),
                options: {}
            }]);
            expect(mockMonacoEditor.deltaDecorations.mock.calls[1][1]).toStrictEqual([{
                range: monacoLineRange(line),
                options: monacoOptions(state, message)
            }]);
            done();
        }, 700);
    });
};

/* eslint-disable import/first */
import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import CodeEditor from "../../../../src/app/components/code/CodeEditor.vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import { BasicConfig } from "../../../../src/app/types/responseTypes";
import { mockBasicState, mockCodeState, mockModelState } from "../../../mocks";

describe("CodeEditor", () => {
    const mockHelpDirective = jest.fn();
    const getWrapper = (readOnlyCode = false,
        mockUpdateCode = jest.fn(),
        defaultCode = ["default code"],
        odinModelResponse = { valid: true }) => {
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
        jest.clearAllMocks();
    });

    it("initialises Monaco Editor", (done) => {
        const wrapper = getWrapper();
        setTimeout(() => {
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

            done();
        });
    });

    it("Monaco Editor change handler makes a delayed code update dispatch", (done) => {
        const mockUpdateCode = jest.fn();
        getWrapper(false, mockUpdateCode);
        setTimeout(() => {
            expect(mockMonacoEditor.onDidChangeModelContent).toHaveBeenCalled();
            const changeHandler = mockMonacoEditor.onDidChangeModelContent.mock.calls[0][0];

            // Trigger the handler the component has set and check that it invokes the action after 1s -
            // it will get the new code we've mocked above in getLines()
            changeHandler();
            expect(mockUpdateCode).not.toHaveBeenCalled();
            setTimeout(() => {
                expect(mockUpdateCode).toHaveBeenCalled();
                expect(mockUpdateCode.mock.calls[0][1]).toStrictEqual(["new code"]);
                done();
            }, 700);
        });
    });

    it("initialises Monaco Editor as readonly if state is configured with readOnlyCode", (done) => {
        getWrapper(true);
        setTimeout(() => {
            expect(mockMonaco.editor.create.mock.calls[0][1].readOnly).toBe(true);
            done();
        });
    });

    it("uses help directive on reset button", () => {
        const wrapper = getWrapper();
        const reset = wrapper.find("button#reset-btn");
        expect(mockHelpDirective).toHaveBeenCalledTimes(1);
        expect(mockHelpDirective.mock.calls[0][0]).toBe(reset.element);
        expect(mockHelpDirective.mock.calls[0][1].value).toBe("resetCode");
    });

    it("can reset monaco editor", (done) => {
        const mockUpdateCode = jest.fn();
        const wrapper = getWrapper(false, mockUpdateCode);
        setTimeout(() => {
            expect(mockMonacoEditor.setValue).not.toHaveBeenCalled();
            wrapper.find("#reset-btn").trigger("click");
            expect(mockMonacoEditor.setValue).toHaveBeenCalled();
            expect(mockMonacoEditor.setValue).toHaveBeenCalledWith("default code");
            done();
        });
    });

    it("does not render reset button when no default code and is not readOnly", () => {
        const mockUpdateCode = jest.fn();
        const wrapper = getWrapper(false, mockUpdateCode, []);
        expect(wrapper.find("#reset-btn").exists()).toBe(false);
    });

    it("does not render reset button when is readOnly", () => {
        const mockUpdateCode = jest.fn();
        const wrapper = getWrapper(true, mockUpdateCode);
        expect(wrapper.find("#reset-btn").exists()).toBe(false);
    });

    it("executes deltaDecorations when there is an error", (done) => {
        const mockUpdateCode = jest.fn();
        const odinModelResponse = {
            valid: false,
            error: { line: [2], message: "error here" }
        };
        getWrapper(false, mockUpdateCode, ["hey code"], odinModelResponse);
        expectDeltaDecorationInputs(2, "error", "error here", done);
    });

    it("no input in deltaDecorations when error lines and messages are empty", (done) => {
        const mockUpdateCode = jest.fn();
        const odinModelResponse = {
            valid: false,
            error: {}
        };
        getWrapper(false, mockUpdateCode, ["hey code"], odinModelResponse);
        setTimeout(() => {
            const changeHandler = mockMonacoEditor.onDidChangeModelContent.mock.calls[0][0];
            changeHandler();
            setTimeout(() => {
                expect(mockMonacoEditor.deltaDecorations).toHaveBeenCalledTimes(4);
                expect(mockMonacoEditor.deltaDecorations.mock.calls[1][1]).toStrictEqual([]);
                done();
            }, 700);
        });
    });

    it("executes deltaDecorations when there is an warning", (done) => {
        const mockUpdateCode = jest.fn();
        const odinModelResponse = {
            valid: true,
            metadata: {
                messages: [{ line: [3], message: "warning here" }]
            }
        };
        getWrapper(false, mockUpdateCode, ["hey code"], odinModelResponse);
        expectDeltaDecorationInputs(3, "warning", "warning here", done);
    });

    it("no input in deltaDecorations when warning lines and messages are empty", (done) => {
        const mockUpdateCode = jest.fn();
        const odinModelResponse = {
            valid: true,
            metadata: {
                messages: [{ line: [], message: "" }]
            }
        };
        getWrapper(false, mockUpdateCode, ["hey code"], odinModelResponse);
        setTimeout(() => {
            const changeHandler = mockMonacoEditor.onDidChangeModelContent.mock.calls[0][0];
            changeHandler();
            setTimeout(() => {
                expect(mockMonacoEditor.deltaDecorations).toHaveBeenCalledTimes(4);
                expect(mockMonacoEditor.deltaDecorations.mock.calls[1][1]).toStrictEqual([]);
                done();
            }, 700);
        });
    });
});
