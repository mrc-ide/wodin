// Mock plotly before import RunTab, which indirectly imports plotly via RunModelPlot
jest.mock("plotly.js", () => {});

/* eslint-disable import/first */
import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState, mockModelState } from "../../../mocks";
import { RequiredModelAction } from "../../../../src/app/store/model/state";
import RunTab from "../../../../src/app/components/run/RunTab.vue";
import RunModelPlot from "../../../../src/app/components/run/RunModelPlot.vue";

describe("RunTab", () => {
    const getWrapper = (odinRunner = {} as any,
        odin = {} as any,
        requiredAction: RequiredModelAction | null = null,
        mockRunModel = jest.fn()) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState({
                        odinRunner,
                        odin,
                        requiredAction
                    }),
                    actions: {
                        RunModel: mockRunModel
                    }
                }
            }
        });
        return shallowMount(RunTab, {
            global: {
                plugins: [store]
            }
        });
    };

    it("renders as expected when can run model", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("button").text()).toBe("Run model");
        expect(wrapper.find("button").element.disabled).toBe(false);
        expect(wrapper.find(".run-update-msg").text()).toBe("");
        expect(wrapper.findComponent(RunModelPlot).props("fadePlot")).toBe(false);
    });

    it("disables run button when state has no odinRunner", () => {
        const wrapper = getWrapper(null);
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("disables run button when state has no odin model", () => {
        const wrapper = getWrapper({} as any, null);
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("disabled run button when compile is required", () => {
        const wrapper = getWrapper({} as any, {} as any, RequiredModelAction.Compile);
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("fades plot and shows message when compile required", () => {
        const wrapper = getWrapper({} as any, {} as any, RequiredModelAction.Compile);
        expect(wrapper.find(".run-update-msg").text()).toBe(
            "Model code has been updated. Compile code and Run Model to view updated graph."
        );
        expect(wrapper.findComponent(RunModelPlot).props("fadePlot")).toBe(true);
    });

    it("fades plot and shows message when model run required", () => {
        const wrapper = getWrapper({} as any, {} as any, RequiredModelAction.Run);
        expect(wrapper.find(".run-update-msg").text()).toBe(
            "Model code has been recompiled or options have been updated. Run Model to view updated graph."
        );
        expect(wrapper.findComponent(RunModelPlot).props("fadePlot")).toBe(true);
    });

    it("invokes run model action when run button is clicked", () => {
        const mockRunModel = jest.fn();
        const wrapper = getWrapper({} as any, {} as any, null, mockRunModel);
        wrapper.find("button").trigger("click");
        expect(mockRunModel).toHaveBeenCalled();
    });
});
