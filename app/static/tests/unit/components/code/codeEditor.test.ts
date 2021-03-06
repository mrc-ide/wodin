// Mock the import of monaco loader so we can mock its methods
const mockMonacoEditor = {
    onDidChangeModelContent: jest.fn(),
    getModel: () => {
        return { getLinesContent: jest.fn().mockReturnValueOnce(["new code"]) };
    },
    setValue: jest.fn()
};

const mockMonaco = {
    editor: {
        create: jest.fn().mockReturnValue(mockMonacoEditor)
    }
};
jest.mock("@monaco-editor/loader", () => {
    return { init: async () => mockMonaco };
});

/* eslint-disable import/first */
import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import CodeEditor from "../../../../src/app/components/code/CodeEditor.vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState, mockCodeState } from "../../../mocks";

describe("CodeEditor", () => {
    const getWrapper = (readOnlyCode = false, mockUpdateCode = jest.fn(), defaultCode = ["default code"]) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({
                config: {
                    defaultCode,
                    readOnlyCode,
                    basicProp: ""
                }
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
                }
            }
        });

        return shallowMount(CodeEditor, {
            global: {
                plugins: [store]
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
                readOnly: false
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
            }, 1000);
        });
    });

    it("initialises Monaco Editor as readonly if state is configured with readOnlyCode", (done) => {
        getWrapper(true);
        setTimeout(() => {
            expect(mockMonaco.editor.create.mock.calls[0][1].readOnly).toBe(true);
            done();
        });
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
});
