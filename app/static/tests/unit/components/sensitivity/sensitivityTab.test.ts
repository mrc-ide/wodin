import { mount } from "@vue/test-utils";
import Vuex from "vuex";
import { nextTick } from "vue";
import { ModelState } from "../../../../src/app/store/model/state";
import SensitivityTab from "../../../../src/app/components/sensitivity/SensitivityTab.vue";
import ActionRequiredMessage from "../../../../src/app/components/ActionRequiredMessage.vue";
import { BaseSensitivityGetter, SensitivityGetter } from "../../../../src/app/store/sensitivity/getters";
import SensitivityTracesPlot from "../../../../src/app/components/sensitivity/SensitivityTracesPlot.vue";
import { SensitivityPlotType, SensitivityState } from "../../../../src/app/store/sensitivity/state";
import { SensitivityAction } from "../../../../src/app/store/sensitivity/actions";
import SensitivitySummaryPlot from "../../../../src/app/components/sensitivity/SensitivitySummaryPlot.vue";
import ErrorInfo from "../../../../src/app/components/ErrorInfo.vue";
import { AppState, AppType } from "../../../../src/app/store/appState/state";
import { ModelGetter } from "../../../../src/app/store/model/getters";
import LoadingSpinner from "../../../../src/app/components/LoadingSpinner.vue";
import { SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";
import DownloadOutput from "../../../../src/app/components/DownloadOutput.vue";

jest.mock("plotly.js-basic-dist-min", () => {});

describe("SensitivityTab", () => {
    const mockRunSensitivity = jest.fn();
    const mockSetLoading = jest.fn();
    const mockSetUserSummaryDownloadFileName = jest.fn();
    const mockDownloadSummary = jest.fn();
    const mockSetPlotTime = jest.fn();

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
                        selectedVariables: ["S"],
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
                        userSummaryDownloadFileName: "",
                        ...sensitivityState
                    },
                    getters: {
                        [BaseSensitivityGetter.batchPars]: () => batchPars
                    },
                    actions: {
                        [SensitivityAction.RunSensitivity]: mockRunSensitivity,
                        [SensitivityAction.DownloadSummary]: mockDownloadSummary
                    },
                    mutations: {
                        [SensitivityMutation.SetLoading]: mockSetLoading,
                        [SensitivityMutation.SetUserSummaryDownloadFileName]: mockSetUserSummaryDownloadFileName,
                        [SensitivityMutation.SetPlotTime]: mockSetPlotTime
                    }
                }
            }
        });
        return mount(SensitivityTab, {
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

    it("enables download button when expected", () => {
        const expectDownloadButtonEnabled = (state: Partial<SensitivityState>, expectButtonEnabled: boolean) => {
            const wrapper = getWrapper(AppType.Basic, {}, state);
            const button = wrapper.find("button#download-summary-btn");
            expect((button.element as HTMLButtonElement).disabled).toBe(!expectButtonEnabled);
        };

        // enabled if not downloading, and no update required, and batch result exists
        const noUpdateRequiredReasons = {
            modelChanged: false,
            parameterValueChanged: false,
            endTimeChanged: false,
            sensitivityOptionsChanged: false,
            numberOfReplicatesChanged: false
        };
        const enabledResult = {
            inputs: {},
            batch: {
                solutions: ["test solution"] as any,
                errors: []
            },
            error: null
        };
        const enabledState = {
            downloading: false,
            sensitivityUpdateRequired: noUpdateRequiredReasons,
            result: enabledResult
        } as any;
        expectDownloadButtonEnabled(enabledState, true);

        // disabled if downloading
        expectDownloadButtonEnabled({ ...enabledState, downloading: true }, false);

        // disabled if update required
        expectDownloadButtonEnabled({
            ...enabledState,
            sensitivityUpdateRequired: { modelChanged: true }
        }, false);

        // disabled if no batch result
        expectDownloadButtonEnabled({
            ...enabledState,
            result: { ...enabledResult, batch: null }
        }, false);
    });

    it("renders DownloadOutput as expected", () => {
        const wrapper = getWrapper(AppType.Basic, {}, { userSummaryDownloadFileName: "test.xlsx" });
        const downloadOutput = wrapper.findComponent(DownloadOutput);
        expect(downloadOutput.props().open).toBe(false);
        expect(downloadOutput.props().downloadType).toBe("Sensitivity Summary");
        expect(downloadOutput.props().includePoints).toBe(false);
        expect(downloadOutput.props().userFileName).toBe("test.xlsx");
    });

    it("renders downloading as expected", () => {
        // does not render if not downloading
        let wrapper = getWrapper();
        expect(wrapper.find("div#downloading").exists()).toBe(false);

        // does render if downloading
        wrapper = getWrapper(AppType.Basic, {}, { downloading: true });
        const downloading = wrapper.find("div#downloading");
        expect(downloading.text()).toBe("Downloading...");
        expect(wrapper.findComponent(LoadingSpinner).props("size")).toBe("xs");
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

    it("disables run button when loading is true", () => {
        const wrapper = getWrapper(AppType.Fit, {}, { loading: true });
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("disables run button when running is true", () => {
        const wrapper = getWrapper(AppType.Fit, {}, { running: true });
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

    it("renders expected update message when no selected variables", () => {
        const sensitivityState = {
            result: {
                batch: {
                    solutions: [{}],
                    errors: []
                }
            }
        } as any;
        const wrapper = getWrapper(AppType.Basic, { selectedVariables: [] }, sensitivityState);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message"))
            .toBe("Please select at least one variable.");
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
            .toBe("Plot is out of date: model code has been recompiled. Run Sensitivity to update.");
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
            .toBe("Plot is out of date: parameters have been changed. Run Sensitivity to update.");
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
        wrapper.find("button").trigger("click");
        await new Promise((r) => setTimeout(r, 101));
        expect(mockRunSensitivity).toHaveBeenCalledTimes(1);
        expect(mockSetLoading).toHaveBeenCalledTimes(1);
    });

    it("opens dialog on click download button", async () => {
        const wrapper = getWrapper();
        await wrapper.find("button#download-summary-btn").trigger("click");
        expect(wrapper.findComponent(DownloadOutput).props().open).toBe(true);
    });

    it("commits user download filename change", () => {
        const wrapper = getWrapper();
        const downloadOutput = wrapper.findComponent(DownloadOutput);
        downloadOutput.vm.$emit("update:userFileName", "newFile.xlsx");
        expect(mockSetUserSummaryDownloadFileName).toHaveBeenCalledTimes(1);
        expect(mockSetUserSummaryDownloadFileName.mock.calls[0][1]).toBe("newFile.xlsx");
    });

    it("verifies end time and dispatches action on download output emit", () => {
        const wrapper = getWrapper();
        const downloadOutput = wrapper.findComponent(DownloadOutput);
        downloadOutput.vm.$emit("download", { fileName: "test.xlsx" });
        // should have updated plot settings time to run end time
        expect(mockSetPlotTime.mock.calls[0][1]).toBe(100);
        expect(mockDownloadSummary.mock.calls[0][1]).toBe("test.xlsx");
    });

    it("closes output dialog on close emit", async () => {
        const wrapper = getWrapper();
        await wrapper.find("#download-summary-btn").trigger("click");
        const downloadOutput = wrapper.findComponent(DownloadOutput);
        expect(downloadOutput.props().open).toBe(true);
        downloadOutput.vm.$emit("close");
        await nextTick();
        expect(downloadOutput.props().open).toBe(false);
    });
});
