import { mount } from "@vue/test-utils";
import Vuex, { Store } from "vuex";
import OptionsTab from "../../../../src/app/components/options/OptionsTab.vue";
import VerticalCollapse from "../../../../src/app/components/VerticalCollapse.vue";
import ParameterValues from "../../../../src/app/components/options/ParameterValues.vue";
import RunOptions from "../../../../src/app/components/options/RunOptions.vue";
import LinkData from "../../../../src/app/components/options/LinkData.vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import { FitState } from "../../../../src/app/store/fit/state";
import { AppType, VisualisationTab } from "../../../../src/app/store/appState/state";
import SensitivityOptions from "../../../../src/app/components/options/SensitivityOptions.vue";
import OptimisationOptions from "../../../../src/app/components/options/OptimisationOptions.vue";
import { mockModelState, mockRunState } from "../../../mocks";
import { RunMutation } from "../../../../src/app/store/run/mutations";
import GraphSettings from "../../../../src/app/components/options/GraphSettings.vue";

describe("OptionsTab", () => {
    const getWrapper = (store: Store<any>) => {
        return mount(OptionsTab, {
            global: {
                plugins: [store]
            }
        });
    };

    const fitAppState = {
        appType: AppType.Fit,
        openVisualisationTab: VisualisationTab.Run,
        model: {
        },
        run: {
            parameterValues: {}
        },
        modelFit: {
            paramsToVary: []
        },
        sensitivity: {
            paramSettings: {}
        },
        graphSettings: {
            logScaleYAxis: false
        }
    } as any;

    it("renders as expected for Basic app", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                appType: AppType.Basic,
                openVisualisationTab: VisualisationTab.Run,
                run: {
                    parameterValues: { param1: 1, param2: 2.2 }
                },
                graphSettings: {
                    logScaleYAxis: false
                }
            } as any
        });
        const wrapper = getWrapper(store);
        const collapses = wrapper.findAllComponents(VerticalCollapse);
        expect(collapses.length).toBe(3);
        expect(collapses.at(0)!.props("title")).toBe("Model Parameters");
        expect(collapses.at(0)!.props("collapseId")).toBe("model-params");
        const paramValues = collapses.at(0)!.findComponent(ParameterValues);
        expect(paramValues.exists()).toBe(true);
        expect(collapses.at(1)!.props("title")).toBe("Run Options");
        expect(collapses.at(1)!.props("collapseId")).toBe("run-options");
        expect(collapses.at(1)!.findComponent(RunOptions).exists()).toBe(true);
        expect(collapses.at(2)!.props("title")).toBe("Graph Settings");
        expect(collapses.at(2)!.props("collapseId")).toBe("graph-settings");
        expect(collapses.at(2)!.findComponent(GraphSettings).exists()).toBe(true);
        expect(wrapper.find("#reset-params-btn").exists()).toBe(true);
        expect(wrapper.find("#reset-params-btn").text()).toBe("Reset");
    });

    it("can reset model parameters", async () => {
        const mockUpdateParameterValuesMutation = jest.fn();
        const store = new Vuex.Store<BasicState>({
            state: {
                appType: AppType.Basic,
                openVisualisationTab: VisualisationTab.Run,
                graphSettings: {
                    logScaleYAxis: false
                }
            } as any,
            modules: {
                run: {
                    namespaced: true,
                    state: mockRunState({ parameterValues: { param1: 21, param2: 23 } }),
                    mutations: {
                        [RunMutation.UpdateParameterValues]: mockUpdateParameterValuesMutation
                    }
                },
                model: {
                    namespaced: true,
                    state: mockModelState({
                        odinModelResponse: {
                            valid: true,
                            metadata: {
                                parameters: [
                                    { name: "param1", default: 200 },
                                    { name: "param2", default: 100 }
                                ]
                            } as any
                        }
                    })
                }
            }
        });
        const wrapper = await getWrapper(store);

        expect(wrapper.find("#reset-params-btn").exists()).toBe(true);
        const parameters = wrapper.findComponent(ParameterValues);
        expect(parameters.findAll(".row").length).toBe(2);
        const input = parameters.findAll(".parameter-input").at(0)?.element as HTMLInputElement;
        expect(input.value).toBe("21");
        await wrapper.find("#reset-params-btn").trigger("click");
        expect(mockUpdateParameterValuesMutation.mock.calls[0][1]).toEqual({ param1: 200, param2: 100 });
    });

    it("renders as expected for Fit app", () => {
        const store = new Vuex.Store<FitState>({
            state: {
                appType: AppType.Fit,
                openVisualisationTab: VisualisationTab.Fit,
                run: {
                    parameterValues: { param1: 1, param2: 2.2 }
                },
                model: {
                },
                modelFit: {
                    paramsToVary: []
                },
                fitData: {
                    columnToFit: null
                },
                graphSettings: {
                    logScaleYAxis: false
                }
            } as any
        });
        const wrapper = getWrapper(store);

        const collapses = wrapper.findAllComponents(VerticalCollapse);
        expect(collapses.length).toBe(5);
        expect(collapses.at(0)!.props("title")).toBe("Link");
        expect(collapses.at(0)!.props("collapseId")).toBe("link-data");
        expect(collapses.at(0)!.findComponent(LinkData).exists()).toBe(true);
        expect(collapses.at(1)!.props("title")).toBe("Model Parameters");
        expect(collapses.at(1)!.props("collapseId")).toBe("model-params");
        const paramValues = collapses.at(1)!.findComponent(ParameterValues);
        expect(paramValues.exists()).toBe(true);
        expect(collapses.at(2)!.props("title")).toBe("Run Options");
        expect(collapses.at(2)!.props("collapseId")).toBe("run-options");
        expect(collapses.at(2)!.findComponent(RunOptions).exists()).toBe(true);
        expect(collapses.at(3)!.props("title")).toBe("Optimisation");
        expect(collapses.at(3)!.props("collapseId")).toBe("optimisation");
        expect(collapses.at(3)!.findComponent(OptimisationOptions).exists()).toBe(true)
        expect(collapses.at(4)!.props("title")).toBe("Graph Settings");
        expect(collapses.at(4)!.props("collapseId")).toBe("graph-settings");
        expect(collapses.at(4)!.findComponent(GraphSettings).exists()).toBe(true);
        expect(wrapper.find("#reset-params-btn").exists()).toBe(true);
        expect(wrapper.find("#reset-params-btn").text()).toBe("Reset");
    });

    it("renders as expected when sensitivity tab is not open", () => {
        const store = new Vuex.Store<FitState>({ state: fitAppState });
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(SensitivityOptions).exists()).toBe(false);
    });

    it("renders as expected when sensitivity tab is open", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                ...fitAppState,
                openVisualisationTab: VisualisationTab.Sensitivity,
                run: {
                    parameterValues: { param1: 1, param2: 2.2 }
                }
            }
        });
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(SensitivityOptions).exists()).toBe(true);
        expect(wrapper.find("#reset-params-btn").exists()).toBe(true);
        expect(wrapper.find("#reset-params-btn").text()).toBe("Reset");
    });
});
