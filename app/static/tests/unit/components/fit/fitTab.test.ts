import { mount } from "@vue/test-utils";
import Vuex from "vuex";
import VueFeather from "vue-feather";
import FitTab from "../../../../src/components/fit/FitTab.vue";
import { FitState } from "../../../../src/store/fit/state";
import ActionRequiredMessage from "../../../../src/components/ActionRequiredMessage.vue";
import LoadingSpinner from "../../../../src/components/LoadingSpinner.vue";
import FitPlot from "../../../../src/components/fit/FitPlot.vue";
import { mockFitState, mockGraphsState } from "../../../mocks";
import { WodinError } from "../../../../src/types/responseTypes";
import ErrorInfo from "../../../../src/components/ErrorInfo.vue";

describe("Fit Tab", () => {
    const getWrapper = (
        fitRequirements = {}, // ends up being true
        compileRequired = false,
        fitUpdateRequired = {},
        iterations: number | null = 10,
        converged: boolean | null = true,
        fitting = false,
        sumOfSquares: number | null = 2.1,
        mockFitModel = vi.fn(),
        mockSetFitting = vi.fn(),
        error: WodinError | null = null
    ) => {
        const store = new Vuex.Store<FitState>({
            state: mockFitState(),
            modules: {
                model: {
                    namespaced: true,
                    state: {
                        compileRequired
                    }
                },
                graphSettings: {
                    namespaced: true,
                    state: mockGraphsState()
                },
                modelFit: {
                    namespaced: true,
                    state: {
                        iterations,
                        converged,
                        fitting,
                        sumOfSquares,
                        fitUpdateRequired,
                        error,
                        result: {
                            solution: vi.fn()
                        }
                    } as any,
                    getters: {
                        fitRequirements: () => fitRequirements
                    } as any,
                    actions: {
                        FitModel: mockFitModel
                    },
                    mutations: {
                        SetFitting: mockSetFitting
                    }
                }
            }
        });

        return mount(FitTab, {
            global: {
                plugins: [store],
                stubs: ["wodin-plot"]
            }
        });
    };

    it("renders as expected when fit has completed", () => {
        const wrapper = getWrapper();
        expect((wrapper.find("#fit-btn").element as HTMLButtonElement).disabled).toBe(false);
        expect((wrapper.find("#cancel-fit-btn").element as HTMLButtonElement).disabled).toBe(true);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        const fitPlot = wrapper.findComponent(FitPlot);
        expect(fitPlot.props("fadePlot")).toBe(false);
        expect(wrapper.vm.iconType).toBe("check");
        expect(wrapper.vm.iconClass).toBe("text-success");
        expect(wrapper.vm.fitting).toBe(false);
        expect(wrapper.vm.iterations).toBe(10);
        expect(wrapper.vm.sumOfSquares).toBe(2.1);
        expect(fitPlot.find("#fit-cancelled-msg").exists()).toBe(false);
        expect(wrapper.findComponent(ErrorInfo).props("error")).toBe(null);
    });

    it("renders as expected when fit is running", () => {
        const wrapper = getWrapper({}, false, false, 5, false, true, 123.45);
        expect((wrapper.find("#fit-btn").element as HTMLButtonElement).disabled).toBe(true);
        expect((wrapper.find("#cancel-fit-btn").element as HTMLButtonElement).disabled).toBe(false);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        const fitPlot = wrapper.findComponent(FitPlot);
        expect(fitPlot.props("fadePlot")).toBe(false);
        expect(wrapper.vm.iconType).toBe(null);
        expect(wrapper.vm.fitting).toBe(true);
        expect(wrapper.vm.iterations).toBe(5);
        expect(wrapper.vm.sumOfSquares).toBe(123.45);
        expect(wrapper.vm.cancelled).toBe(false);
    });

    it("renders as expected before fit runs", () => {
        const wrapper = getWrapper({}, false, false, null, null, false, null);
        expect((wrapper.find("#fit-btn").element as HTMLButtonElement).disabled).toBe(false);
        expect((wrapper.find("#cancel-fit-btn").element as HTMLButtonElement).disabled).toBe(true);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        const fitPlot = wrapper.findComponent(FitPlot);
        expect(fitPlot.props("fadePlot")).toBe(false);
        expect(wrapper.vm.iconType).toBe(null);
        expect(wrapper.vm.fitting).toBe(false);
        expect(wrapper.vm.iterations).toBe(null);
        expect(wrapper.vm.cancelled).toBe(null);
    });

    it("renders as expected when fit has been cancelled", () => {
        const wrapper = getWrapper({}, false, false, 1, false, false, 121.2);
        expect((wrapper.find("#fit-btn").element as HTMLButtonElement).disabled).toBe(false);
        expect((wrapper.find("#cancel-fit-btn").element as HTMLButtonElement).disabled).toBe(true);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        const fitPlot = wrapper.findComponent(FitPlot);
        expect(fitPlot.props("fadePlot")).toBe(false);
        expect(wrapper.vm.iconType).toBe("alert-circle");
        expect(wrapper.vm.iconClass).toBe("text-secondary");
        expect(wrapper.vm.fitting).toBe(false);
        expect(wrapper.vm.iterations).toBe(1);
        expect(wrapper.vm.sumOfSquares).toBe(121.2);
        expect(wrapper.vm.cancelled).toBe(true);
        expect(wrapper.vm.cancelledMsg).toBe("Model fit was cancelled before converging");
    });

    it("renders as expected when cannot run fit", () => {
        const fitRequirements = {
            hasModel: false,
            hasData: false
        };
        const wrapper = getWrapper(fitRequirements, false, false, null, null, false, null);
        expect((wrapper.find("#fit-btn").element as HTMLButtonElement).disabled).toBe(true);
        expect((wrapper.find("#cancel-fit-btn").element as HTMLButtonElement).disabled).toBe(true);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Cannot fit model. Please compile a model (Code tab) and upload a data set (Data tab)."
        );
        const fitPlot = wrapper.findComponent(FitPlot);
        expect(fitPlot.props("fadePlot")).toBe(true);
        expect(wrapper.vm.fitting).toBe(false);
        expect(wrapper.vm.iterations).toBe(null);
        expect(wrapper.vm.cancelled).toBe(null);
    });

    it("renders as expected when compile is required", () => {
        const wrapper = getWrapper({}, true, false);
        expect((wrapper.find("#fit-btn").element as HTMLButtonElement).disabled).toBe(false);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Model code has been updated. Compile code and Fit Model for updated best fit."
        );
        const fitPlot = wrapper.findComponent(FitPlot);
        expect(fitPlot.props("fadePlot")).toBe(true);
        expect(wrapper.vm.iconType).toBe("check");
        expect(wrapper.vm.iterations).toBe(10);
        expect(wrapper.vm.sumOfSquares).toBe(2.1);
    });

    it("renders as expected when fit update is required", () => {
        const wrapper = getWrapper({}, false, { dataChanged: true });
        expect((wrapper.find("#fit-btn").element as HTMLButtonElement).disabled).toBe(false);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Fit is out of date: data have been updated. Rerun fit to update."
        );
        const fitPlot = wrapper.findComponent(FitPlot);
        expect(fitPlot.props("fadePlot")).toBe(true);
        expect(wrapper.vm.fitting).toBe(false);
        expect(wrapper.vm.iterations).toBe(10);
        expect(wrapper.vm.sumOfSquares).toBe(2.1);
    });

    it("renders model fit error as expected", () => {
        const error = { error: "test error", detail: "test detail" };
        const wrapper = getWrapper({}, false, {}, 10, true, false, 2.1, vi.fn(), vi.fn(), error);
        expect(wrapper.findComponent(ErrorInfo).props("error")).toStrictEqual(error);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "An error occurred during model fit."
        );
    });

    it("dispatches fit action on click button", async () => {
        const mockFitModel = vi.fn();
        const wrapper = getWrapper({}, false, false, null, null, false, null, mockFitModel);
        await wrapper.find("#fit-btn").trigger("click");
        expect(mockFitModel).toHaveBeenCalledTimes(1);
    });

    it("cancel button sets fitting to false", async () => {
        const mockSetFitting = vi.fn();
        const wrapper = getWrapper({}, false, false, 1, false, true, 25.6, vi.fn(), mockSetFitting);
        await wrapper.find("#cancel-fit-btn").trigger("click");
        expect(mockSetFitting).toHaveBeenCalledTimes(1);
        expect(mockSetFitting.mock.calls[0][1]).toBe(false);
    });
});
