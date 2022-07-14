import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import VueFeather from "vue-feather";
import CodeTab from "../../../../src/app/components/code/CodeTab.vue";
import CodeEditor from "../../../../src/app/components/code/CodeEditor.vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState, mockModelState } from "../../../mocks";
import ErrorInfo from "../../../../src/app/components/ErrorInfo.vue";
import { ModelState } from "../../../../src/app/store/model/state";

describe("CodeTab", () => {
    const defaultModelState = {
        odinModelResponse: {
            valid: true
        } as any
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockCompileModel = jest.fn();

    const getWrapper = (odinModelState: Partial<ModelState> = defaultModelState) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState(odinModelState),
                    actions: {
                        CompileModel: mockCompileModel
                    }
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

    it("compile button dispatches compile action", () => {
        const wrapper = getWrapper();
        wrapper.find("button").trigger("click");
        expect(mockCompileModel).toHaveBeenCalled();
    });

    it("displays error info in run model", () => {
        const error = { error: "model error", detail: "with details" };
        const wrapper = getWrapper({ error });
        expect(wrapper.findComponent(ErrorInfo).exists()).toBe(true);
        expect(wrapper.findComponent(ErrorInfo).props("error")).toStrictEqual(error);
    });
});
