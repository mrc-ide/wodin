// Mock plotly before import RunTab, which indirectly imports plotly via RunPlot
jest.mock("plotly.js", () => {});

/* eslint-disable import/first */
import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState, mockModelState, mockRunState } from "../../../mocks";
import { ModelState } from "../../../../src/app/store/model/state";
import { RunState } from "../../../../src/app/store/run/state";
import RunTab from "../../../../src/app/components/run/RunTab.vue";
import RunPlot from "../../../../src/app/components/run/RunPlot.vue";
import ErrorInfo from "../../../../src/app/components/ErrorInfo.vue";
import ActionRequiredMessage from "../../../../src/app/components/ActionRequiredMessage.vue";

describe("RunTab", () => {
    const defaultModelState = {
        odinRunner: {} as any,
        odin: {} as any,
        compileRequired: false
    };

    const defaultRunState = {
        runRequired: false
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockRunModel = jest.fn();

    const getWrapper = (modelState: Partial<ModelState> = defaultModelState,
        runState: Partial<RunState> = defaultRunState) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState(modelState),
                    actions: {
                    }
                },
                run: {
                    namespaced: true,
                    state: mockRunState(runState),
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
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        expect(wrapper.findComponent(RunPlot).props("fadePlot")).toBe(false);
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
        const wrapper = getWrapper({
            compileRequired: true
        });
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("fades plot and shows message when compile required", () => {
        const wrapper = getWrapper({
            compileRequired: true
        });
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Model code has been updated. Compile code and Run Model to view updated graph."
        );
        expect(wrapper.findComponent(RunPlot).props("fadePlot")).toBe(true);
    });

    it("fades plot and shows message when model run required", () => {
        const wrapper = getWrapper({ compileRequired: false }, { runRequired: true });
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Model code has been recompiled or options have been updated. Run Model to view updated graph."
        );
        expect(wrapper.findComponent(RunPlot).props("fadePlot")).toBe(true);
    });

    it("invokes run model action when run button is clicked", () => {
        const wrapper = getWrapper();
        wrapper.find("button").trigger("click");
        expect(mockRunModel).toHaveBeenCalled();
    });

    it("displays error info in run model", () => {
        const odinRunnerError = { error: "model error", detail: "with details" };
        const wrapper = getWrapper({}, { error: odinRunnerError });
        expect(wrapper.findComponent(ErrorInfo).exists()).toBe(true);
        expect(wrapper.findComponent(ErrorInfo).props("error")).toStrictEqual(odinRunnerError);
    });
});
