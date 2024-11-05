import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { ModelState } from "../../../../src/store/model/state";
import { BasicState } from "../../../../src/store/basic/state";
import { mockBasicState, mockModelState } from "../../../mocks";
import GraphConfigsCollapsible from "../../../../src/components/graphConfig/GraphConfigsCollapsible.vue";
import VerticalCollapse from "../../../../src/components/VerticalCollapse.vue";

describe("GraphConfigsCollapsible", () => {
    const defaultModelState = {
        compileRequired: false,
        odinModelResponse: {
            metadata: {
                variables: ["S", "I", "R"]
            },
            valid: true
        } as any
    };

    const getWrapper = (modelState: Partial<ModelState> = {}) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({
                configured: true
            }),
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState({ ...defaultModelState, ...modelState })
                }
            }
        });

        return shallowMount(GraphConfigsCollapsible, {
            global: {
                plugins: [store]
            }
        });
    };

    it("renders collapsible when graph configs should be shown", () => {
        const wrapper = getWrapper();
        expect(wrapper.findComponent(VerticalCollapse).props("title")).toBe("Graphs");
    });

    it("does not render collapsible when no variables in model", () => {
        const wrapper = getWrapper({
            odinModelResponse: {
                metadata: {
                    variables: []
                },
                valid: true
            } as any
        });
        expect(wrapper.findComponent(VerticalCollapse).exists()).toBe(false);
    });

    it("does not render collapsible when compile required", () => {
        const wrapper = getWrapper({
            compileRequired: true
        });
        expect(wrapper.findComponent(VerticalCollapse).exists()).toBe(false);
    });
});
