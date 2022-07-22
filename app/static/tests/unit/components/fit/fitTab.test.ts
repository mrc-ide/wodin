// Mock plotly before import RunTab, which indirectly imports plotly via RunModelPlot
import {RequiredModelAction} from "../../../../src/app/store/model/state";

jest.mock("plotly.js", () => {});

/* eslint-disable import/first */
import { mount } from "@vue/test-utils";
import Vuex from "vuex";
import VueFeather from "vue-feather";
import FitTab from "../../../../src/app/components/fit/FitTab.vue";
import { FitState } from "../../../../src/app/store/fit/state";
import ActionRequiredMessage from "../../../../src/app/components/ActionRequiredMessage.vue";
import LoadingSpinner from "../../../../src/app/components/LoadingSpinner.vue";
import RunModelPlot from "../../../../src/app/components/run/RunModelPlot.vue";
import { mockFitState } from "../../../mocks";

describe("Fit Tab", () => {
    const getWrapper = (
        canRunFit = true,
        compileRequired = false,
        fitUpdateRequired = false,
        iterations: number | null = 10,
        converged: boolean | null = true,
        fitting = false,
        sumOfSquares: number | null = 2.1,
        mockFitModel = jest.fn()
    ) => {
        const store = new Vuex.Store<FitState>({
            state: mockFitState(),
            modules: {
                model: {
                    namespaced: true,
                    state: {
                        requiredAction: compileRequired ? RequiredModelAction.Compile : null
                    }
                },
                modelFit: {
                    namespaced: true,
                    state: {
                        iterations,
                        converged,
                        fitting,
                        sumOfSquares,
                        fitUpdateRequired

                    } as any,
                    getters: {
                        canRunFit: () => canRunFit
                    } as any,
                    actions: {
                        FitModel: mockFitModel
                    }
                }
            }
        });

        return mount(FitTab, {
            global: {
                plugins: [store]
            }
        });
    };

    it("renders as expected when fit has completed", () => {
        const wrapper = getWrapper();
        expect((wrapper.find("#fit-btn").element as HTMLButtonElement).disabled).toBe(false);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        const runModelPlot = wrapper.findComponent(RunModelPlot);
        expect(runModelPlot.props("fadePlot")).toBe(false);
        expect(runModelPlot.findComponent(VueFeather).props("type")).toBe("check");
        expect(runModelPlot.findComponent(LoadingSpinner).exists()).toBe(false);
        expect(runModelPlot.findAll("span").at(0)!.text()).toBe("Iterations: 10");
        expect(runModelPlot.findAll("span").at(1)!.text()).toBe("Sum of squares: 2.1");
    });

    it("renders as expected when fit is running", () => {
        const wrapper = getWrapper(true, false, false, 5, false, true, 123.45);
        expect((wrapper.find("#fit-btn").element as HTMLButtonElement).disabled).toBe(false);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        const runModelPlot = wrapper.findComponent(RunModelPlot);
        expect(runModelPlot.props("fadePlot")).toBe(false);
        expect(runModelPlot.props("modelFit")).toBe(true);
        expect(runModelPlot.findComponent(VueFeather).exists()).toBe(false);
        expect(runModelPlot.findComponent(LoadingSpinner).props("size")).toBe("xs");
        expect(runModelPlot.findAll("span").at(0)!.text()).toBe("Iterations: 5");
        expect(runModelPlot.findAll("span").at(1)!.text()).toBe("Sum of squares: 123.45");
    });

    it("renders as expected before fit runs", () => {
        const wrapper = getWrapper(true, false, false, null, null, false, null);
        expect((wrapper.find("#fit-btn").element as HTMLButtonElement).disabled).toBe(false);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        const runModelPlot = wrapper.findComponent(RunModelPlot);
        expect(runModelPlot.props("fadePlot")).toBe(false);
        expect(runModelPlot.findComponent(VueFeather).exists()).toBe(false);
        expect(runModelPlot.findComponent(LoadingSpinner).exists()).toBe(false);
        expect(runModelPlot.findAll("span").length).toBe(0);
    });

    it("renders as expected when cannot run fit", () => {
        const wrapper = getWrapper(false, false, false, null, null, false, null);
        expect((wrapper.find("#fit-btn").element as HTMLButtonElement).disabled).toBe(true);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message"))
            .toBe("Cannot fit model. Please provide valid data and code, and link at least one variable.");
        const runModelPlot = wrapper.findComponent(RunModelPlot);
        expect(runModelPlot.props("fadePlot")).toBe(true);
        expect(runModelPlot.findComponent(VueFeather).exists()).toBe(false);
        expect(runModelPlot.findComponent(LoadingSpinner).exists()).toBe(false);
        expect(runModelPlot.findAll("span").length).toBe(0);
    });

    it("renders as expected when compile is required", () => {
        const wrapper = getWrapper(true, true, false);
        expect((wrapper.find("#fit-btn").element as HTMLButtonElement).disabled).toBe(false);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message"))
            .toBe("Model code has been updated. Compile code and Fit Model for updated best fit.");
        const runModelPlot = wrapper.findComponent(RunModelPlot);
        expect(runModelPlot.props("fadePlot")).toBe(true);
        expect(runModelPlot.findComponent(VueFeather).props("type")).toBe("check");
        expect(runModelPlot.findAll("span").at(0)!.text()).toBe("Iterations: 10");
        expect(runModelPlot.findAll("span").at(1)!.text()).toBe("Sum of squares: 2.1");
    });

    it("renders as expected when fit update is required", () => {
        const wrapper = getWrapper(true, false, true);
        expect((wrapper.find("#fit-btn").element as HTMLButtonElement).disabled).toBe(false);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message"))
            .toBe("Model code has been recompiled, or options or data have been updated. Fit Model for updated best fit.");
        const runModelPlot = wrapper.findComponent(RunModelPlot);
        expect(runModelPlot.props("fadePlot")).toBe(true);
        expect(runModelPlot.findComponent(LoadingSpinner).exists()).toBe(false);
        expect(runModelPlot.findAll("span").at(0)!.text()).toBe("Iterations: 10");
        expect(runModelPlot.findAll("span").at(1)!.text()).toBe("Sum of squares: 2.1");
    });

    it("dispatches fit action on click button", async () => {
        const mockFitModel = jest.fn();
        const wrapper = getWrapper(true, false, false,null, null, false, null, mockFitModel);
        await wrapper.find("#fit-btn").trigger("click");
        expect(mockFitModel).toHaveBeenCalledTimes(1);
    });
});
