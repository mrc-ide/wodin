// Mock plotly before import RunTab, which indirectly imports plotly via RunModelPlot
jest.mock("plotly.js", () => {});

/* eslint-disable import/first */
import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState, mockModelState } from "../../../mocks";
import { ModelState, RequiredModelAction } from "../../../../src/app/store/model/state";
import RunTab from "../../../../src/app/components/run/RunTab.vue";
import RunModelPlot from "../../../../src/app/components/run/RunModelPlot.vue";
import ErrorInfo from "../../../../src/app/components/ErrorInfo.vue";

describe("RunTab", () => {
    const defaultModelState = {
        odinRunner: {} as any,
        odin: {} as any,
        requiredAction: null
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockRunModel = jest.fn();

    const getWrapper = (modelState: Partial<ModelState> = defaultModelState) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState(modelState),
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
        const wrapper = getWrapper({ odinRunner: null });
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("disables run button when state has no odin model", () => {
        const wrapper = getWrapper({ odin: null });
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("disabled run button when compile is required", () => {
        const wrapper = getWrapper({ requiredAction: RequiredModelAction.Compile });
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("fades plot and shows message when compile required", () => {
        const wrapper = getWrapper({ requiredAction: RequiredModelAction.Compile });
        expect(wrapper.find(".run-update-msg").text()).toBe(
            "Model code has been updated. Compile code and Run Model to view updated graph."
        );
        expect(wrapper.findComponent(RunModelPlot).props("fadePlot")).toBe(true);
    });

    it("fades plot and shows message when model run required", () => {
        const wrapper = getWrapper({ requiredAction: RequiredModelAction.Run });
        expect(wrapper.find(".run-update-msg").text()).toBe(
            "Model code has been recompiled or options have been updated. Run Model to view updated graph."
        );
        expect(wrapper.findComponent(RunModelPlot).props("fadePlot")).toBe(true);
    });

    it("invokes run model action when run button is clicked", () => {
        const wrapper = getWrapper();
        wrapper.find("button").trigger("click");
        expect(mockRunModel).toHaveBeenCalled();
    });

    it("displays error info in run model", () => {
        const error = { error: "model error", detail: "with details" };
        const wrapper = getWrapper({ error });
        expect(wrapper.findComponent(ErrorInfo).exists()).toBe(true);
        expect(wrapper.findComponent(ErrorInfo).props("error")).toStrictEqual(error);
    });
});
