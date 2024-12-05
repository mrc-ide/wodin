import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import VueFeather from "vue-feather";
import CodeTab from "../../../../src/components/code/CodeTab.vue";
import CodeEditor from "../../../../src/components/code/CodeEditor.vue";
import { BasicState } from "../../../../src/store/basic/state";
import { mockBasicState, mockCodeState, mockModelState } from "../../../mocks";
import ErrorInfo from "../../../../src/components/ErrorInfo.vue";
import { ModelState } from "../../../../src/store/model/state";
import GenericHelp from "../../../../src/components/help/GenericHelp.vue";
import GraphConfigsCollapsible from "@/components/graphConfig/GraphConfigsCollapsible.vue";

describe("CodeTab", () => {
    const defaultModelState = {
        compileRequired: false,
        odinModelResponse: {
            metadata: {
                variables: ["S", "I", "R"]
            },
            valid: true
        } as any
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockCompileModel = vi.fn();

    const getWrapper = (odinModelState: Partial<ModelState> = defaultModelState, loading = false) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({
                configured: true
            }),
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState(odinModelState),
                    actions: {
                        CompileModel: mockCompileModel
                    }
                },
                code: {
                    namespaced: true,
                    state: mockCodeState({ loading })
                }
            }
        });

        return shallowMount(CodeTab, {
            global: {
                plugins: [store]
            }
        });
    };

    it("renders as expected with valid code", () => {
        const wrapper = getWrapper();
        expect(wrapper.findComponent(CodeEditor).exists()).toBe(true);
        expect(wrapper.find("button").text()).toBe("Compile");
        expect(wrapper.find("button").element.disabled).toBe(false);
        expect(wrapper.find("#code-status").text()).toBe("Code is valid");
        const statusIcon = wrapper.find("#code-status").findComponent(VueFeather);
        expect(statusIcon.attributes("type")).toBe("check");
        expect(statusIcon.classes()).toContain("text-success");
        expect(wrapper.findComponent(GraphConfigsCollapsible).exists()).toBe(true);
        expect(wrapper.findComponent(GenericHelp).props("title")).toBe("Write odin code");
        expect(wrapper.findComponent(GenericHelp).props("markdown")).toContain("Write code in this editor");
    });

    it("shows code invalid message and disabled compile button when odin response has valid false", () => {
        const wrapper = getWrapper({
            odinModelResponse: {
                valid: false
            } as any
        });
        expect(wrapper.find("button").element.disabled).toBe(true);
        expect(wrapper.find("#code-status").text()).toBe("Code is not valid");
        const statusIcon = wrapper.find("#code-status").findComponent(VueFeather);
        expect(statusIcon.attributes("type")).toBe("x");
        expect(statusIcon.classes()).toContain("text-danger");
    });

    it("shows greyed out icon and greyed out message when code is validating", () => {
        const wrapper = getWrapper(defaultModelState, true);
        expect(wrapper.find("#code-status").classes()).toContain("code-validating-text");
        const statusIcon = wrapper.find("#code-status").findComponent(VueFeather);
        expect(statusIcon.classes()).toContain("code-validating-icon");
    });

    it("compile button dispatches compile action", () => {
        const wrapper = getWrapper();
        wrapper.find("button").trigger("click");
        expect(mockCompileModel).toHaveBeenCalled();
    });

    it("displays error info in run model", () => {
        const odinModelResponseError = { error: "model error", detail: "with details" };
        const wrapper = getWrapper({ odinModelCodeError: odinModelResponseError });
        expect(wrapper.findComponent(ErrorInfo).exists()).toBe(true);
        expect(wrapper.findComponent(ErrorInfo).props("error")).toStrictEqual(odinModelResponseError);
    });

    it("renders nothing when app state is not configured", () => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState()
        });

        const wrapper = shallowMount(CodeTab, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.findAll("div").length).toBe(0);
    });
});
