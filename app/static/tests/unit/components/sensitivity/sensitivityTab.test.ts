import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import { ModelState } from "../../../../src/app/store/model/state";
import SensitivityTab from "../../../../src/app/components/sensitivity/SensitivityTab.vue";
import ActionRequiredMessage from "../../../../src/app/components/ActionRequiredMessage.vue";
import { BaseSensitivityGetter } from "../../../../src/app/store/sensitivity/getters";
import SensitivityTracesPlot from "../../../../src/app/components/sensitivity/SensitivityTracesPlot.vue";
import { SensitivityPlotType, SensitivityState } from "../../../../src/app/store/sensitivity/state";
import { SensitivityAction } from "../../../../src/app/store/sensitivity/actions";
import SensitivitySummaryPlot from "../../../../src/app/components/sensitivity/SensitivitySummaryPlot.vue";
import ErrorInfo from "../../../../src/app/components/ErrorInfo.vue";
import { AppState, AppType } from "../../../../src/app/store/appState/state";
import { ModelGetter } from "../../../../src/app/store/model/getters";
import LoadingSpinner from "../../../../src/app/components/LoadingSpinner.vue";
import { SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";
import SensitivitySummaryDownload from "../../../../src/app/components/sensitivity/SensitivitySummaryDownload.vue";
import LoadingButton from "../../../../src/app/components/LoadingButton.vue";
import { getters as graphsGetters } from "../../../../src/app/store/graphs/getters";

jest.mock("plotly.js-basic-dist-min", () => {});

describe("SensitivityTab", () => {
    const mockRunSensitivity = jest.fn();
    const mockSetLoading = jest.fn();
    const mockSetPlotTime = jest.fn();

    const getWrapper = (
        appType = AppType.Basic,
        modelState: Partial<ModelState> = {},
        sensitivityState: Partial<SensitivityState> = {},
        batchPars: any = {},
        hasRunner = true,
        selectedVariables = ["S"]
    ) => {
        const store = new Vuex.Store<AppState>({
            state: {
                appType
            } as any,
            modules: {
                graphs: {
                    namespaced: true,
                    state: {
                        config: [
                            {
                                selectedVariables
                            }
                        ]
                    },
                    getters: graphsGetters
                },
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
                run: {
                    namespaced: true,
                    state: {
                        endTime: 100
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
                            plotType: SensitivityPlotType.TraceOverTime,
                            time: null
                        },
                        paramSettings: {
                            numberOfRuns: 5
                        },
                        ...sensitivityState
                    },
                    getters: {
                        [BaseSensitivityGetter.batchPars]: () => batchPars
                    },
                    actions: {
                        [SensitivityAction.RunSensitivity]: mockRunSensitivity
                    },
                    mutations: {
                        [SensitivityMutation.SetLoading]: mockSetLoading,
                        [SensitivityMutation.SetPlotTime]: mockSetPlotTime
                    }
                }
            }
        });
        return shallowMount(SensitivityTab, {
            global: {
                plugins: [store],
                stubs: [
                    "action-required-message",
                    "sensitivity-traces-plot",
                    "sensitivity-summary-plot",
                    "loading-spinner",
                    "error-info"
                ]
            }
        });
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders as expected when Trace over Time", () => {
        const wrapper = getWrapper();
        expect(wrapper.findComponent(LoadingButton).props("isDisabled")).toBe(false);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        expect(wrapper.findComponent(SensitivityTracesPlot).props("fadePlot")).toBe(false);
        expect(wrapper.findComponent(ErrorInfo).props("error")).toBe(null);
        expect(wrapper.find("#sensitivity-running").exists()).toBe(false);
        expect(wrapper.findComponent(SensitivitySummaryPlot).exists()).toBe(false);
    });

    it("enables sensitivity when app is stochastic and runner is available", () => {
        const wrapper = getWrapper(AppType.Stochastic);
        expect(wrapper.findComponent(LoadingButton).props("isDisabled")).toBe(false);
    });

    it("renders as expected when Value at Time", () => {
        const sensitivityState = { plotSettings: { plotType: SensitivityPlotType.ValueAtTime } as any };
        const wrapper = getWrapper(AppType.Fit, {}, sensitivityState);
        expect(wrapper.findComponent(LoadingButton).props("isDisabled")).toBe(false);
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

    it("renders SensitivitySummaryDownload", () => {
        const wrapper = getWrapper(AppType.Basic);
        const download = wrapper.findComponent(SensitivitySummaryDownload);
        expect(download.props("multiSensitivity")).toBe(false);
        expect(download.props("downloadType")).toBe("Sensitivity Summary");
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
        expect(wrapper.findComponent(LoadingButton).props("isDisabled")).toBe(true);
    });

    it("disables run button when no odin model", () => {
        const wrapper = getWrapper(AppType.Fit, { odin: null });
        expect(wrapper.findComponent(LoadingButton).props("isDisabled")).toBe(true);
    });

    it("disables run button when required action is Compile", () => {
        const wrapper = getWrapper(AppType.Basic, {
            compileRequired: true
        });
        expect(wrapper.findComponent(LoadingButton).props("isDisabled")).toBe(true);
    });

    it("disables run button when no batchPars", () => {
        const wrapper = getWrapper(AppType.Basic, {}, {}, null);
        expect(wrapper.findComponent(LoadingButton).props("isDisabled")).toBe(true);
    });

    it("sets loading prop on LoadingBUtton when loading is true", () => {
        const wrapper = getWrapper(AppType.Fit, {}, { loading: true });
        expect(wrapper.findComponent(LoadingButton).props("loading")).toBe(true);
    });

    it("sets loading prop on LoadingButton when running is true", () => {
        const wrapper = getWrapper(AppType.Fit, {}, { running: true });
        expect(wrapper.findComponent(LoadingButton).props("loading")).toBe(true);
    });

    it("renders expected update message when required action is Compile", () => {
        const sensitivityState = {
            result: {
                batch: { solutions: [{}], errors: [] }
            }
        } as any;
        const wrapper = getWrapper(AppType.Basic, { compileRequired: true }, sensitivityState);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Model code has been updated. Compile code and Run Sensitivity to update."
        );
        expect(wrapper.findComponent(SensitivityTracesPlot).props("fadePlot")).toBe(true);
    });

    it("renders expected update message when no selected variables", () => {
        const sensitivityState = {
            result: {
                batch: {
                    solutions: [{}],
                    errors: []
                }
            }
        } as any;
        const wrapper = getWrapper(AppType.Basic, {}, sensitivityState, {}, true, []);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Please select at least one variable."
        );
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
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Plot is out of date: model code has been recompiled. Run Sensitivity to update."
        );
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
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Plot is out of date: parameters have been changed. Run Sensitivity to update."
        );
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

    it("commits set loading and dispatches sensitivity run when button is clicked", async () => {
        const wrapper = getWrapper();
        expect(mockRunSensitivity).not.toHaveBeenCalled();
        expect(mockSetLoading).not.toHaveBeenCalled();
        wrapper.findComponent(LoadingButton).vm.$emit("click");
        await new Promise((r) => setTimeout(r, 101));
        expect(mockRunSensitivity).toHaveBeenCalledTimes(1);
        expect(mockSetLoading).toHaveBeenCalledTimes(1);
    });
});
