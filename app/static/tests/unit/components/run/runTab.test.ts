import VueFeather from "vue-feather";
import Vuex, { Store } from "vuex";
import { shallowMount } from "@vue/test-utils";
import { nextTick } from "vue";
import { BasicState } from "../../../../src/store/basic/state";
import {
    mockBasicState,
    mockFitState,
    mockGraphsState,
    mockModelState,
    mockRunState,
    mockStochasticState
} from "../../../mocks";
import RunTab from "../../../../src/components/run/RunTab.vue";
import ErrorInfo from "../../../../src/components/ErrorInfo.vue";
import ActionRequiredMessage from "../../../../src/components/ActionRequiredMessage.vue";
import DownloadOutput from "../../../../src/components/DownloadOutput.vue";
import LoadingSpinner from "../../../../src/components/LoadingSpinner.vue";
import { StochasticState } from "../../../../src/store/stochastic/state";
import { ModelGetter } from "../../../../src/store/model/getters";
import { AppType, VisualisationTab } from "../../../../src/store/appState/state";
import { RunMutation } from "../../../../src/store/run/mutations";
import { RunAction } from "../../../../src/store/run/actions";
import { FitState } from "../../../../src/store/fit/state";
import { defaultGraphConfig } from "@/store/graphs/state";
import { ConfigGroupIds } from "@/store/graphs/graphs";
import { GraphsMutation } from "@/store/graphs/mutations";
import WodinPlot from "@/components/WodinPlot.vue";

describe("RunTab", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockRunModel = vi.fn();
    const mockDownloadOutput = vi.fn();
    const mockSetUserDownloadFileName = vi.fn();

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
        appType: T, hasRunner = true
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
                    state: mockModelState({ odin: {} as any }),
                    actions: {},
                    getters: {
                        [ModelGetter.hasRunner]: () => hasRunner
                    } as any
                },
                run: {
                    namespaced: true,
                    state: mockRunState(),
                    actions: {
                        [RunAction.RunModel]: mockRunModel,
                        [RunAction.DownloadOutput]: mockDownloadOutput
                    },
                    mutations: {
                        [RunMutation.SetUserDownloadFileName]: mockSetUserDownloadFileName
                    }
                }
            }
        });
    }

    const getWrapper = <T extends AppType>(store: Store<AppTypeToState[T]>) => {
        return shallowMount(RunTab, {
            global: {
                plugins: [store],
            }
        });
    };

    it("renders as expected when can run model", () => {
        const store = getStore(AppType.Basic);
        store.state.run.userDownloadFileName = "test.xlsx";
        const wrapper = getWrapper(store);
        expect(wrapper.find("button#run-btn").text()).toBe("Run model");
        expect((wrapper.find("button#run-btn").element as HTMLButtonElement).disabled).toBe(false);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        const plots = wrapper.findAllComponents(WodinPlot);
        expect(plots.length).toBe(2);
        expect(plots.at(0)!.props("fadePlot")).toBe(false);
        expect(plots.at(0)!.props("config")).toStrictEqual(store.state.graphs.configs[0]);
        expect(plots.at(1)!.props("fadePlot")).toBe(false);
        expect(plots.at(1)!.props("config")).toStrictEqual(store.state.graphs.configs[1]);

        // Download button disabled because there is no model solution
        const downloadBtn = wrapper.find("button#download-btn");
        expect(downloadBtn.text()).toBe("Download");
        expect((downloadBtn.element as HTMLButtonElement).disabled).toBe(true);
        expect(downloadBtn.findComponent(VueFeather).props("type")).toBe("download");
        const downloadOutput = wrapper.findComponent(DownloadOutput);
        expect(downloadOutput.props().open).toBe(false);
        expect(downloadOutput.props().downloadType).toBe("Run");
        expect(downloadOutput.props().includePoints).toBe(true);
        expect(downloadOutput.props().userFileName).toBe("test.xlsx");

        expect(wrapper.find("#downloading").exists()).toBe(false);
    });

    it("renders sumOfSquares for Fit app", () => {
        const store = getStore(AppType.Fit);
        store.state.modelFit.sumOfSquares = 21.2;
        const wrapper = getWrapper(store);
        expect(wrapper.findAll("#squares").length).toBe(1);
        expect(wrapper.find("#squares").text()).toBe("Sum of squares: 21.2");
    });

    it("renders as expected when app is stochastic", () => {
        const store = getStore(AppType.Stochastic);
        store.state.run.resultDiscrete = { solution: vi.fn() } as any;
        const wrapper = getWrapper(store);
        const plots = wrapper.findAllComponents(WodinPlot);
        expect(plots.length).toBe(2);
        expect(plots.at(0)!.props("fadePlot")).toBe(false);
        expect(plots.at(0)!.props("config")).toStrictEqual(store.state.graphs.configs[0]);

        expect(plots.at(1)!.props("fadePlot")).toBe(false);
        expect(plots.at(1)!.props("config")).toStrictEqual(store.state.graphs.configs[1]);

        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        expect((wrapper.find("button#run-btn").element as HTMLButtonElement).disabled).toBe(false);
    });

    it("disables run button when state has no runner", () => {
        const store = getStore(AppType.Basic, false);
        store.state.model.odinRunnerOde = null;
        const wrapper = getWrapper(store);
        expect((wrapper.find("button#run-btn").element as HTMLButtonElement).disabled).toBe(true);
    });

    it("disables run button when state has no odin model", () => {
        const store = getStore(AppType.Basic);
        store.state.model.odin = null;
        const wrapper = getWrapper(store);
        expect((wrapper.find("button#run-btn").element as HTMLButtonElement).disabled).toBe(true);
    });

    it("disables run and download buttons when compile is required", () => {
        const store = getStore(AppType.Basic);
        store.state.model.compileRequired = true;
        store.state.run.resultOde = { solution: {} } as any;
        const wrapper = getWrapper(store);
        expect((wrapper.find("button#run-btn").element as HTMLButtonElement).disabled).toBe(true);
        expect((wrapper.find("button#download-btn").element as HTMLButtonElement).disabled).toBe(true);
    });

    it("enables download button when model has a solution", () => {
        const store = getStore(AppType.Basic);
        store.state.run.resultOde = { solution: {} } as any;
        const wrapper = getWrapper(store);
        expect((wrapper.find("button#download-btn").element as HTMLButtonElement).disabled).toBe(false);
    });

    it("disables download button when run is required", () => {
        const store = getStore(AppType.Basic);
        store.state.run.resultOde = { solution: {} } as any;
        store.state.run.runRequired.modelChanged = true;
        const wrapper = getWrapper(store);
        expect((wrapper.find("button#download-btn").element as HTMLButtonElement).disabled).toBe(true);
    });

    it("disables download button and show message when downloading", () => {
        const store = getStore(AppType.Basic);
        store.state.run.resultOde = { solution: {} } as any;
        store.state.run.downloading = true;
        const wrapper = getWrapper(store);
        expect((wrapper.find("button#download-btn").element as HTMLButtonElement).disabled).toBe(true);
        expect(wrapper.find("#downloading").text()).toBe("Downloading...");
        expect(wrapper.find("#downloading").findComponent(LoadingSpinner).exists()).toBe(true);
    });

    it("fades plot and shows message when compile required", () => {
        const store = getStore(AppType.Basic);
        store.state.model.compileRequired = true;
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Model code has been updated. Compile code and Run Model to update."
        );
        const plots = wrapper.findAllComponents(WodinPlot);
        expect(plots.at(0)!.props("fadePlot")).toBe(true);
        expect(plots.at(1)!.props("fadePlot")).toBe(true);
    });

    it("fades plot and shows message when model run required", () => {
        const store = getStore(AppType.Basic);
        store.state.run.runRequired.modelChanged = true;
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Plot is out of date: model code has been recompiled. Run model to update."
        );
        const plots = wrapper.findAllComponents(WodinPlot);
        expect(plots.at(0)!.props("fadePlot")).toBe(true);
        expect(plots.at(1)!.props("fadePlot")).toBe(true);
    });

    it("fades plot and show message when no selected variables", () => {
        const store = getStore(AppType.Basic);
        store.state.graphs.configs[0].selectedVariables = [];
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Please select at least one variable."
        );
        const plots = wrapper.findAllComponents(WodinPlot);
        expect(plots.at(0)!.props("fadePlot")).toBe(true);
        expect(plots.at(1)!.props("fadePlot")).toBe(true);
    });

    it("fades plot when compile required when stochastic", () => {
        const store = getStore(AppType.Stochastic);
        store.state.model.compileRequired = true;
        const wrapper = getWrapper(store);
        const plots = wrapper.findAllComponents(WodinPlot);
        expect(plots.at(0)!.props("fadePlot")).toBe(true);
        expect(plots.at(1)!.props("fadePlot")).toBe(true);
    });

    it("invokes run model action when run button is clicked", () => {
        const store = getStore(AppType.Basic);
        const wrapper = getWrapper(store);
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
        const store = getStore(AppType.Basic);
        store.state.run.resultOde = result;
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(ErrorInfo).exists()).toBe(true);
        expect(wrapper.findComponent(ErrorInfo).props("error")).toStrictEqual(odinRunnerError);
    });

    it("opens download dialog on click download button, and closes when dialog emits close event", async () => {
        const store = getStore(AppType.Basic);
        store.state.run.resultOde = { solution: {} } as any;
        const wrapper = getWrapper(store);
        await wrapper.find("button#download-btn").trigger("click");
        const download = wrapper.findComponent(DownloadOutput);
        expect(download.props().open).toBe(true);
        download.vm.$emit("close");
        await nextTick();
        expect(download.props().open).toBe(false);
    });

    it("hides run button if app is stochastic", () => {
        const store = getStore(AppType.Stochastic);
        const wrapper = getWrapper(store);
        expect(wrapper.find("button#download-btn").exists()).toBe(false);
    });

    it("commits user download filename change", () => {
        const store = getStore(AppType.Basic);
        const wrapper = getWrapper(store);
        const downloadOutput = wrapper.findComponent(DownloadOutput);
        downloadOutput.vm.$emit("update:userFileName", "newFileName.xlsx");
        expect(mockSetUserDownloadFileName).toHaveBeenCalledTimes(1);
        expect(mockSetUserDownloadFileName.mock.calls[0][1]).toBe("newFileName.xlsx");
    });

    it("dispatches download output action", () => {
        const store = getStore(AppType.Basic);
        const wrapper = getWrapper(store);
        const downloadOutput = wrapper.findComponent(DownloadOutput);
        const payload = { fileName: "downlad.xlsx", points: 100 };
        downloadOutput.vm.$emit("download", payload);
        expect(mockDownloadOutput).toHaveBeenCalledTimes(1);
        expect(mockDownloadOutput.mock.calls[0][1]).toBe(payload);
    });

    it("sets visible graph groups on mount", () => {
        const store = getStore(AppType.Basic);
        getWrapper(store);
        expect(mockAddConfig).not.toHaveBeenCalled();
        expect(mockUpdateConfig).not.toHaveBeenCalled();
        expect(mockUpdateConfigGroup).not.toHaveBeenCalled();
        expect(mockUpdateVisibleGraphGroups.mock.calls[0][1]).toStrictEqual([VisualisationTab.Run]);
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
        expect(mockUpdateVisibleGraphGroups.mock.calls[0][1]).toStrictEqual([VisualisationTab.Run]);
    });
});
