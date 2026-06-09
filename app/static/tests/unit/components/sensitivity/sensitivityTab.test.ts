import { shallowMount } from "@vue/test-utils";
import Vuex, { Store } from "vuex";
import SensitivityTab from "../../../../src/components/sensitivity/SensitivityTab.vue";
import ActionRequiredMessage from "../../../../src/components/ActionRequiredMessage.vue";
import { BaseSensitivityGetter } from "../../../../src/store/sensitivity/getters";
import { SensitivityPlotType } from "../../../../src/store/sensitivity/state";
import { SensitivityAction } from "../../../../src/store/sensitivity/actions";
import ErrorInfo from "../../../../src/components/ErrorInfo.vue";
import { AppType, VisualisationTab } from "../../../../src/store/appState/state";
import { ModelGetter } from "../../../../src/store/model/getters";
import LoadingSpinner from "../../../../src/components/LoadingSpinner.vue";
import { SensitivityMutation } from "../../../../src/store/sensitivity/mutations";
import SensitivitySummaryDownload from "../../../../src/components/sensitivity/SensitivitySummaryDownload.vue";
import LoadingButton from "../../../../src/components/LoadingButton.vue";
import { BasicState } from "@/store/basic/state";
import { FitState } from "@/store/fit/state";
import { StochasticState } from "@/store/stochastic/state";
import { mockBasicState, mockFitState, mockGraphsState, mockModelState, mockRunState, mockSensitivityState, mockStochasticState } from "../../../mocks";
import { defaultGraphConfig } from "@/store/graphs/state";
import { ConfigGroupIds } from "@/store/graphs/graphs";
import { GraphsMutation } from "@/store/graphs/mutations";
import WodinPlot from "@/components/WodinPlot.vue";

describe("SensitivityTab", () => {
    const mockRunSensitivity = vi.fn();
    const mockSetLoading = vi.fn();
    const mockSetPlotTime = vi.fn();

    const mockAddConfig = vi.fn();
    const mockUpdateConfig = vi.fn();
    const mockUpdateConfigGroup = vi.fn();
    const mockUpdateVisibleGraphGroups = vi.fn();

    type AppTypeToState = {
        [AppType.Basic]: BasicState,
        [AppType.Fit]: FitState,
        [AppType.Stochastic]: StochasticState,
    }

    const mockStates = {
        [AppType.Basic]: mockBasicState(),
        [AppType.Fit]: mockFitState(),
        [AppType.Stochastic]: mockStochasticState(),
    } as const;

    const getStore = <T extends AppType>(
        appType: T,
        hasRunner = true,
        batchPars: any = {},
    ): Store<AppTypeToState[T]> => {
        const config1 = defaultGraphConfig("123");
        config1.selectedVariables = ["S"];
        const config2 = defaultGraphConfig("456");

        const graphsState = mockGraphsState();
        graphsState.configs = [config1, config2];
        graphsState.configGroups[ConfigGroupIds.RunAndSens].configIds = ["123", "456"];

        return new Vuex.Store<AppTypeToState[T]>({
            state: mockStates[appType],
            modules: {
                graphs: {
                    namespaced: true,
                    state: graphsState,
                    mutations: {
                        [GraphsMutation.AddConfig]: mockAddConfig,
                        [GraphsMutation.UpdateConfig]: mockUpdateConfig,
                        [GraphsMutation.UpdateConfigGroup]: mockUpdateConfigGroup,
                        [GraphsMutation.UpdateVisibleGraphGroups]: mockUpdateVisibleGraphGroups,
                    }
                },
                model: {
                    namespaced: true,
                    state: mockModelState({
                        odin: {} as any
                    }),
                    getters: {
                        [ModelGetter.hasRunner]: () => hasRunner
                    }
                },
                run: {
                    namespaced: true,
                    state: mockRunState(),
                },
                sensitivity: {
                    namespaced: true,
                    state: mockSensitivityState({
                        result: {
                            inputs: {} as any,
                            batch: {
                                solutions: [],
                                errors: []
                            } as any,
                            error: null
                        }
                    }),
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
    };

    const getWrapper = <T extends AppType>(store: Store<AppTypeToState[T]>) => {
        return shallowMount(SensitivityTab, {
            global: {
                plugins: [store]
            }
        });
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders as expected when Trace over Time", () => {
        const store = getStore(AppType.Basic);
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(LoadingButton).props("isDisabled")).toBe(false);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        const plots = wrapper.findAllComponents(WodinPlot);
        expect(plots.length).toBe(2);
        expect(plots.at(0)!.props("fadePlot")).toBe(false);
        expect(plots.at(0)!.props("config")).toStrictEqual(store.state.graphs.configs[0]);
        expect(plots.at(1)!.props("fadePlot")).toBe(false);
        expect(plots.at(1)!.props("config")).toStrictEqual(store.state.graphs.configs[1]);
        expect(wrapper.findComponent(ErrorInfo).props("error")).toBe(null);
        expect(wrapper.find("#sensitivity-running").exists()).toBe(false);
    });

    it("enables sensitivity when app is stochastic and runner is available", () => {
        const store = getStore(AppType.Stochastic);
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(LoadingButton).props("isDisabled")).toBe(false);
    });

    it("renders SensitivitySummaryDownload", () => {
        const store = getStore(AppType.Basic);
        const wrapper = getWrapper(store);
        const download = wrapper.findComponent(SensitivitySummaryDownload);
        expect(download.props("multiSensitivity")).toBe(false);
        expect(download.props("downloadType")).toBe("Sensitivity Summary");
    });

    it("renders error", () => {
        const testError = { error: "Test Error", detail: "test error detail" };
        const store = getStore(AppType.Stochastic);
        store.state.sensitivity.result = {
            inputs: {} as any,
            batch: null,
            error: testError
        };
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(ErrorInfo).props("error")).toStrictEqual(testError);
    });

    it("disables run button when hasRunner is false", () => {
        const store = getStore(AppType.Basic, false);
        store.state.model.odinRunnerOde = null;
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(LoadingButton).props("isDisabled")).toBe(true);
    });

    it("disables run button when no odin model", () => {
        const store = getStore(AppType.Fit);
        store.state.model.odin = null;
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(LoadingButton).props("isDisabled")).toBe(true);
    });

    it("disables run button when required action is Compile", () => {
        const store = getStore(AppType.Basic);
        store.state.model.compileRequired = true;
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(LoadingButton).props("isDisabled")).toBe(true);
    });

    it("disables run button when no batchPars", () => {
        const store = getStore(AppType.Basic, true, null);
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(LoadingButton).props("isDisabled")).toBe(true);
    });

    it("sets loading prop on LoadingBUtton when loading is true", () => {
        const store = getStore(AppType.Fit);
        store.state.sensitivity.loading = true;
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(LoadingButton).props("loading")).toBe(true);
    });

    it("sets loading prop on LoadingButton when running is true", () => {
        const store = getStore(AppType.Fit);
        store.state.sensitivity.running = true;
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(LoadingButton).props("loading")).toBe(true);
    });

    it("renders expected update message when required action is Compile", () => {
        const store = getStore(AppType.Basic);
        store.state.sensitivity.result = {
            batch: {
                solutions: [{}],
                errors: []
            }
        } as any;
        store.state.model.compileRequired = true;
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Model code has been updated. Compile code and Run Sensitivity to update."
        );
        expect(wrapper.findComponent(WodinPlot).props("fadePlot")).toBe(true);
    });

    it("renders expected update message when no selected variables", () => {
        const store = getStore(AppType.Basic);
        store.state.sensitivity.result = {
            batch: {
                solutions: [{}],
                errors: []
            }
        } as any;
        store.state.graphs.configs[0].selectedVariables = [];
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Please select at least one variable."
        );
        expect(wrapper.findComponent(WodinPlot).props("fadePlot")).toBe(true);
    });

    it("renders expected update message when sensitivity requires update", () => {
        const store = getStore(AppType.Basic);
        store.state.sensitivity.result = {
            batch: {
                solutions: [{}],
                errors: []
            }
        } as any;
        store.state.sensitivity.sensitivityUpdateRequired.modelChanged = true;
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Plot is out of date: model code has been recompiled. Run Sensitivity to update."
        );
        expect(wrapper.findComponent(WodinPlot).props("fadePlot")).toBe(true);
    });

    it("fades Summary plot when updated required", () => {
        const store = getStore(AppType.Basic);
        store.state.sensitivity.result = {
            batch: {
                solutions: [{}],
                errors: []
            }
        } as any;
        store.state.sensitivity.sensitivityUpdateRequired.parameterValueChanged = true;
        store.state.sensitivity.plotSettings.plotType = SensitivityPlotType.ValueAtTime;
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Plot is out of date: parameters have been changed. Run Sensitivity to update."
        );
        expect(wrapper.findComponent(WodinPlot).props("fadePlot")).toBe(true);
    });

    it("renders sensitivity running message", () => {
        const store = getStore(AppType.Stochastic);
        store.state.sensitivity.result = {
            batch: {
                solutions: [{}, {}],
                errors: [{}]
            }
        } as any;
        store.state.sensitivity.running = true;
        store.state.sensitivity.paramSettings.numberOfRuns = 12;
        const wrapper = getWrapper(store);
        const runningMsg = wrapper.find("#sensitivity-running");
        expect(runningMsg.text()).toBe("Running sensitivity: finished 3 of 12 runs");
        expect(runningMsg.findComponent(LoadingSpinner).props("size")).toBe("xs");
    });

    it("commits set loading and dispatches sensitivity run when button is clicked", async () => {
        const store = getStore(AppType.Basic);
        const wrapper = getWrapper(store);
        expect(mockRunSensitivity).not.toHaveBeenCalled();
        expect(mockSetLoading).not.toHaveBeenCalled();
        wrapper.findComponent(LoadingButton).vm.$emit("click");
        await new Promise((r) => setTimeout(r, 101));
        expect(mockRunSensitivity).toHaveBeenCalledTimes(1);
        expect(mockSetLoading).toHaveBeenCalledTimes(1);
    });

    it("sets visible graph groups on mount", () => {
        const store = getStore(AppType.Basic);
        getWrapper(store);
        expect(mockAddConfig).not.toHaveBeenCalled();
        expect(mockUpdateConfig).not.toHaveBeenCalled();
        expect(mockUpdateConfigGroup).not.toHaveBeenCalled();
        expect(mockUpdateVisibleGraphGroups.mock.calls[0][1]).toStrictEqual([VisualisationTab.Sensitivity]);
    });

    it("creates config with all variables and group on mount if it doesn't exist", () => {
        const store = getStore(AppType.Basic);
        store.state.graphs.configGroups[ConfigGroupIds.RunAndSens].configIds = [];
        store.state.model.variablesCopy = ["W"];
        getWrapper(store);
        expect(mockAddConfig).toHaveBeenCalled();
        expect(mockUpdateConfig.mock.calls[0][1].value).toStrictEqual({
            selectedVariables: ["W"]
        });
        const cfgId = mockUpdateConfig.mock.calls[0][1].id;
        expect(mockUpdateConfigGroup.mock.calls[0][1]).toStrictEqual({
            id: ConfigGroupIds.RunAndSens,
            value: {
                configIds: [cfgId],
                syncProperties: ["xAxisRange"]
            }
        });
        expect(mockUpdateVisibleGraphGroups.mock.calls[0][1]).toStrictEqual([VisualisationTab.Sensitivity]);
    });
});
