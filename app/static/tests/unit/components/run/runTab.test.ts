// Mock plotly before import RunTab, which indirectly imports plotly via RunPlot
import VueFeather from "vue-feather";

jest.mock("plotly.js-basic-dist-min", () => {});

/* eslint-disable import/first */
import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import {
    mockBasicState, mockModelState, mockRunState, mockStochasticState
} from "../../../mocks";
import { ModelState } from "../../../../src/app/store/model/state";
import { RunState } from "../../../../src/app/store/run/state";
import RunTab from "../../../../src/app/components/run/RunTab.vue";
import RunPlot from "../../../../src/app/components/run/RunPlot.vue";
import RunStochasticPlot from "../../../../src/app/components/run/RunStochasticPlot.vue";
import ErrorInfo from "../../../../src/app/components/ErrorInfo.vue";
import ActionRequiredMessage from "../../../../src/app/components/ActionRequiredMessage.vue";
import DownloadOutput from "../../../../src/app/components/DownloadOutput.vue";
import LoadingSpinner from "../../../../src/app/components/LoadingSpinner.vue";
import { StochasticState } from "../../../../src/app/store/stochastic/state";
import { DiscreteSeriesSet, OdinRunnerDiscrete } from "../../../../src/app/types/responseTypes";
import { OdinRunResultDiscrete } from "../../../../src/app/types/wrapperTypes";
import { ModelGetter } from "../../../../src/app/store/model/getters";
import { AppType } from "../../../../src/app/store/appState/state";

describe("RunTab", () => {
    const defaultModelState = {
        odinRunnerOde: {} as any,
        odin: {} as any,
        compileRequired: false
    };

    const defaultRunState = {
        runRequired: {
            modelChanged: false,
            parameterValueChanged: false,
            endTimeChanged: false,
            numberOfReplicatesChanged: false
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockRunModel = jest.fn();

    const getWrapper = (modelState: Partial<ModelState> = defaultModelState,
        runState: Partial<RunState> = defaultRunState, hasRunner = true, appType = AppType.Basic) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({ appType }),
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState(modelState),
                    actions: {
                    },
                    getters: {
                        [ModelGetter.hasRunner]: () => hasRunner
                    } as any
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

    const getStochasticWrapper = (runner: Partial<OdinRunnerDiscrete> | null = {},
        resultDiscrete: Partial<OdinRunResultDiscrete> | null = null, compileRequired = false) => {
        const store = new Vuex.Store<StochasticState>({
            state: mockStochasticState(),
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState({
                        odin: {} as any,
                        odinRunnerDiscrete: runner as any,
                        compileRequired
                    }),
                    getters: {
                        [ModelGetter.hasRunner]: () => true
                    } as any
                },
                run: {
                    namespaced: true,
                    state: mockRunState({
                        resultDiscrete: resultDiscrete as any
                    })
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
        expect(wrapper.find("button#run-btn").text()).toBe("Run model");
        expect((wrapper.find("button#run-btn").element as HTMLButtonElement).disabled).toBe(false);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        expect(wrapper.findComponent(RunPlot).props("fadePlot")).toBe(false);

        // Download button disabled because there is no model solution
        const downloadBtn = wrapper.find("button#download-btn");
        expect(downloadBtn.text()).toBe("Download");
        expect((downloadBtn.element as HTMLButtonElement).disabled).toBe(true);
        expect(downloadBtn.findComponent(VueFeather).props("type")).toBe("download");
        expect(wrapper.findComponent(DownloadOutput).props().open).toBe(false);

        expect(wrapper.find("#downloading").exists()).toBe(false);
        expect(wrapper.findComponent(RunStochasticPlot).exists()).toBe(false);
    });

    it("renders as expected when app is stochastic", () => {
        const wrapper = getStochasticWrapper({}, {
            solution: jest.fn()
        });
        expect(wrapper.findComponent(RunStochasticPlot).props("fadePlot")).toBe(false);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        expect(wrapper.findComponent(RunPlot).exists()).toBe(false);
        expect((wrapper.find("button#run-btn").element as HTMLButtonElement).disabled).toBe(false);
    });

    it("disables run button when state has no runner", () => {
        const wrapper = getWrapper({ odinRunnerOde: null }, defaultRunState, false);
        expect((wrapper.find("button#run-btn").element as HTMLButtonElement).disabled).toBe(true);
    });

    it("disables run button when state has no odin model", () => {
        const wrapper = getWrapper({ odin: null });
        expect((wrapper.find("button#run-btn").element as HTMLButtonElement).disabled).toBe(true);
    });

    it("disables run and download buttons when compile is required", () => {
        const modelState = { compileRequired: true };
        const runState = { resultOde: { solution: {} } as any };
        const wrapper = getWrapper(modelState, runState);
        expect((wrapper.find("button#run-btn").element as HTMLButtonElement).disabled).toBe(true);
        expect((wrapper.find("button#download-btn").element as HTMLButtonElement).disabled).toBe(true);
    });

    it("enables download button when model has a solution", () => {
        const wrapper = getWrapper({}, { resultOde: { solution: {} } as any });
        expect((wrapper.find("button#download-btn").element as HTMLButtonElement).disabled).toBe(false);
    });

    it("disables download button when run is required ", () => {
        const runState = {
            result: { solution: {} } as any,
            runRequired: { modelChanged: true } as any
        };
        const wrapper = getWrapper({}, runState);
        expect((wrapper.find("button#download-btn").element as HTMLButtonElement).disabled).toBe(true);
    });

    it("disables download button and show message when downloading", () => {
        const runState = {
            result: { solution: {} } as any,
            downloading: true
        };
        const wrapper = getWrapper({}, runState);
        expect((wrapper.find("button#download-btn").element as HTMLButtonElement).disabled).toBe(true);
        expect(wrapper.find("#downloading").text()).toBe("Downloading...");
        expect(wrapper.find("#downloading").findComponent(LoadingSpinner).exists()).toBe(true);
    });

    it("fades plot and shows message when compile required", () => {
        const wrapper = getWrapper({
            compileRequired: true
        });
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Model code has been updated. Compile code and Run Model to update."
        );
        expect(wrapper.findComponent(RunPlot).props("fadePlot")).toBe(true);
    });

    it("fades plot and shows message when model run required", () => {
        const runRequired = {
            modelChanged: true,
            parameterValueChanged: false,
            endTimeChanged: false,
            numberOfReplicatesChanged: false
        };
        const wrapper = getWrapper({ compileRequired: false }, { runRequired });
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Plot is out of date: model code has been recompiled. Run model to update."
        );
        expect(wrapper.findComponent(RunPlot).props("fadePlot")).toBe(true);
    });

    it("fades plot when compile required when stochastic", () => {
        const wrapper = getStochasticWrapper({}, {}, true);
        expect(wrapper.findComponent(RunStochasticPlot).props("fadePlot")).toBe(true);
    });

    it("invokes run model action when run button is clicked", () => {
        const wrapper = getWrapper();
        wrapper.find("button#run-btn").trigger("click");
        expect(mockRunModel).toHaveBeenCalled();
    });

    it("displays error info in run model", () => {
        const odinRunnerError = { error: "model error", detail: "with details" };
        const result = {
            inputs: { endTime: 99, parameterValues: {} },
            error: odinRunnerError,
            solution: null
        };
        const wrapper = getWrapper({}, { resultOde: result });
        expect(wrapper.findComponent(ErrorInfo).exists()).toBe(true);
        expect(wrapper.findComponent(ErrorInfo).props("error")).toStrictEqual(odinRunnerError);
    });

    it("opens download dialog on click download button, and closes when dialog emits close event", async () => {
        const wrapper = getWrapper({}, { resultOde: { solution: {} } as any });
        await wrapper.find("button#download-btn").trigger("click");
        const download = wrapper.findComponent(DownloadOutput);
        expect(download.props().open).toBe(true);
        await download.vm.$emit("close");
        expect(download.props().open).toBe(false);
    });

    it("hides run button if app is stochastic", () => {
        const wrapper = getWrapper({}, {}, true, AppType.Stochastic);
        expect(wrapper.find("button#download-btn").exists()).toBe(false);
    });
});
