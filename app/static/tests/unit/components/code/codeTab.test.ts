import { shallowMount } from "@vue/test-utils";
import CodeTab from "../../../../src/app/components/code/CodeTab.vue";
import CodeEditor from "../../../../src/app/components/code/CodeEditor.vue";
import Vuex from "vuex";
import VueFeather from "vue-feather";
import {BasicState} from "../../../../src/app/store/basic/state";
import {mockBasicState, mockModelState} from "../../../mocks";

describe("CodeTab", () => {
    const getWrapper = (codeIsValid = true, mockCompileModel = jest.fn()) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState({
                        odinModelResponse: {
                            valid: codeIsValid
                        }
                    } as any),
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
        const wrapper = getWrapper(false);
        expect(wrapper.find("button").element.disabled).toBe(true);
        expect(wrapper.find("#code-status").text()).toBe("Code is not valid");
        const statusIcon = wrapper.find("#code-status").findComponent(VueFeather);
        expect(statusIcon.attributes("type")).toBe("x");
        expect(statusIcon.classes()).toContain("text-danger");
    });

    it("compile button dispatches compile action", () => {
        const mockCompileModel = jest.fn();
        const wrapper = getWrapper(true, mockCompileModel);
        wrapper.find("button").trigger("click");
        expect(mockCompileModel).toHaveBeenCalled();
    });
});
