import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import { ModelState } from "../../../../src/app/store/model/state";
import SensitivityTab from "../../../../src/app/components/sensitivity/SensitivityTab.vue";
import ActionRequiredMessage from "../../../../src/app/components/ActionRequiredMessage.vue";
import { SensitivityGetter } from "../../../../src/app/store/sensitivity/getters";
import SensitivityTracesPlot from "../../../../src/app/components/sensitivity/SensitivityTracesPlot.vue";
import { SensitivityPlotType, SensitivityState } from "../../../../src/app/store/sensitivity/state";
import { SensitivityAction } from "../../../../src/app/store/sensitivity/actions";
import SensitivitySummaryPlot from "../../../../src/app/components/sensitivity/SensitivitySummaryPlot.vue";
import ErrorInfo from "../../../../src/app/components/ErrorInfo.vue";
import { AppState, AppType } from "../../../../src/app/store/appState/state";
import { ModelGetter } from "../../../../src/app/store/model/getters";
import LoadingSpinner from "../../../../src/app/components/LoadingSpinner.vue";

jest.mock("plotly.js-basic-dist-min", () => {});

describe("SensitivityTab", () => {
    const mockRunSensitivity = jest.fn();

    const getWrapper = (appType = AppType.Basic, modelState: Partial<ModelState> = {},
        sensitivityState: Partial<SensitivityState> = {}, batchPars: any = {}, hasRunner = true) => {
        const store = new Vuex.Store<AppState>({
            state: {
                appType
            } as any,
            modules: {
                model: {
                    namespaced: true,
                    state: {
                        odinRunnerOde: {},
                        odin: {},
                        ...modelState
                    },
                    getters: {
                        [ModelGetter.hasRunner]: () => hasRunner
                    }
                },
                sensitivity: {
                    namespaced: true,
                    state: {
                        sensitivityUpdateRequired: {
                            modelChanged: false,
                            parameterValueChanged: false,
                            endTimeChanged: false,
                            sensitivityOptionsChanged: false
                        },
                        result: {
                            inputs: {},
                            batch: {
                                solutions: [],
                                errors: []
                            },
                            error: null
                        },
                        plotSettings: {
                            plotType: SensitivityPlotType.TraceOverTime
                        },
                        paramSettings: {
                            numberOfRuns: 5
                        },
                        ...sensitivityState
                    },
                    getters: {
                        [SensitivityGetter.batchPars]: () => batchPars
                    },
                    actions: {
                        [SensitivityAction.RunSensitivity]: mockRunSensitivity
                    }
                }
            }
        });
        return shallowMount(SensitivityTab, {
            global: {
                plugins: [store]
            }
        });
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders as expected when Trace over Time", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("button").text()).toBe("Run sensitivity");
        expect(wrapper.find("button").element.disabled).toBe(false);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        expect(wrapper.findComponent(SensitivityTracesPlot).props("fadePlot")).toBe(false);
        expect(wrapper.findComponent(ErrorInfo).props("error")).toBe(null);
        expect(wrapper.find("#sensitivity-running").exists()).toBe(false);
        expect(wrapper.findComponent(SensitivitySummaryPlot).exists()).toBe(false);
    });

    it("enables sensitivity when app is stochastic and runner is available", () => {
        const wrapper = getWrapper(AppType.Stochastic);
        expect(wrapper.find("button").element.disabled).toBe(false);
    });

    it("renders as expected when Value at Time", () => {
        const sensitivityState = { plotSettings: { plotType: SensitivityPlotType.ValueAtTime } as any };
        const wrapper = getWrapper(AppType.Fit, {}, sensitivityState);
        expect(wrapper.find("button").text()).toBe("Run sensitivity");
        expect(wrapper.find("button").element.disabled).toBe(false);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        expect(wrapper.findComponent(SensitivitySummaryPlot).props("fadePlot")).toBe(false);

        expect(wrapper.findComponent(SensitivityTracesPlot).exists()).toBe(false);
    });

    it("renders as expected when Time at Extreme", () => {
        const sensitivityState = { plotSettings: { plotType: SensitivityPlotType.TimeAtExtreme } as any };
        const wrapper = getWrapper(AppType.Basic, {}, sensitivityState);
        expect(wrapper.findComponent(SensitivitySummaryPlot).props("fadePlot")).toBe(false);
        expect(wrapper.findComponent(SensitivityTracesPlot).exists()).toBe(false);
    });

    it("renders as expected when Value at Extreme", () => {
        const sensitivityState = { plotSettings: { plotType: SensitivityPlotType.ValueAtExtreme } as any };
        const wrapper = getWrapper(AppType.Basic, {}, sensitivityState);
        expect(wrapper.findComponent(SensitivitySummaryPlot).props("fadePlot")).toBe(false);
        expect(wrapper.findComponent(SensitivityTracesPlot).exists()).toBe(false);
    });

    it("renders error", () => {
        const testError = { error: "Test Error", detail: "test error detail" };
        const sensitivityState = {
            result: {
                inputs: {} as any,
                batch: null,
                error: testError
            }
        };
        const wrapper = getWrapper(AppType.Stochastic, {}, sensitivityState);
        expect(wrapper.findComponent(ErrorInfo).props("error")).toStrictEqual(testError);
    });

    it("disables run button when hasRunner is false", () => {
        const wrapper = getWrapper(AppType.Basic, { odinRunnerOde: null }, {}, {}, false);
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("disables run button when no odin model", () => {
        const wrapper = getWrapper(AppType.Fit, { odin: null });
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("disables run button when required action is Compile", () => {
        const wrapper = getWrapper(AppType.Basic, {
            compileRequired: true
        });
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("disables run button when no batchPars", () => {
        const wrapper = getWrapper(AppType.Basic, {}, {}, null);
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("renders expected update message when required action is Compile", () => {
        const sensitivityState = {
            result: {
                batch: { solutions: [{}], errors: [] }
            }
        } as any;
        const wrapper = getWrapper(AppType.Basic, { compileRequired: true }, sensitivityState);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message"))
            .toBe("Model code has been updated. Compile code and Run Sensitivity to update.");
        expect(wrapper.findComponent(SensitivityTracesPlot).props("fadePlot")).toBe(true);
    });

    it("renders expected update message when sensitivity requires update", () => {
        const sensitivityState = {
            result: {
                batch: { solutions: [{}], errors: [] }
            },
            sensitivityUpdateRequired: {
                modelChanged: true,
                endTimeChanged: false
            }
        } as any;
        const wrapper = getWrapper(AppType.Basic, {}, sensitivityState);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message"))
            .toBe("Plot is out of date: model code has been recompiled. Run sensitivity to update.");
        expect(wrapper.findComponent(SensitivityTracesPlot).props("fadePlot")).toBe(true);
    });

    it("fades Summary plot when updated required", () => {
        const sensitivityState = {
            result: {
                batch: { solutions: [{}], errors: [] }
            },
            plotSettings: { plotType: SensitivityPlotType.ValueAtTime } as any,
            sensitivityUpdateRequired: {
                modelChanged: false,
                parameterValueChanged: true,
                endTimeChanged: false
            }
        } as any;
        const wrapper = getWrapper(AppType.Basic, {}, sensitivityState);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message"))
            .toBe("Plot is out of date: parameters have been changed. Run sensitivity to update.");
        expect(wrapper.findComponent(SensitivitySummaryPlot).props("fadePlot")).toBe(true);
    });

    it("renders sensitivity running message", () => {
        const sensitivityState = {
            running: true,
            result: {
                batch: {
                    solutions: [{}, {}],
                    errors: [{}]
                }
            },
            paramSettings: {
                numberOfRuns: 12
            }
        } as any;
        const wrapper = getWrapper(AppType.Stochastic, {}, sensitivityState);
        const runningMsg = wrapper.find("#sensitivity-running");
        expect(runningMsg.text()).toBe("Running sensitivity: finished 3 of 12 runs");
        expect(runningMsg.findComponent(LoadingSpinner).props("size")).toBe("xs");
    });

    it("dispatches sensitivity run when button is clicked", () => {
        const wrapper = getWrapper();
        expect(mockRunSensitivity).not.toHaveBeenCalled();
        wrapper.find("button").trigger("click");
        expect(mockRunSensitivity).toHaveBeenCalledTimes(1);
    });
});
