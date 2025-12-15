import { mount, shallowMount } from "@vue/test-utils";
import Vuex, { Store } from "vuex";
import OptionsTab from "../../../../src/components/options/OptionsTab.vue";
import VerticalCollapse from "../../../../src/components/VerticalCollapse.vue";
import ParameterValues from "../../../../src/components/options/ParameterValues.vue";
import RunOptions from "../../../../src/components/options/RunOptions.vue";
import LinkData from "../../../../src/components/options/LinkData.vue";
import { BasicState } from "../../../../src/store/basic/state";
import { FitState } from "../../../../src/store/fit/state";
import { AppType, VisualisationTab } from "../../../../src/store/appState/state";
import SensitivityOptions from "../../../../src/components/options/SensitivityOptions.vue";
import OptimisationOptions from "../../../../src/components/options/OptimisationOptions.vue";
import { mockModelState, mockRunState } from "../../../mocks";
import { RunMutation } from "../../../../src/store/run/mutations";
import GraphSettings from "../../../../src/components/GraphSettings.vue";
import ParameterSets from "../../../../src/components/options/ParameterSets.vue";
import { getters as runGetters } from "../../../../src/store/run/getters";
import AdvancedSettings from "../../../../src/components/options/AdvancedSettings.vue";
import GraphConfigsCollapsible from "../../../../src/components/graphConfig/GraphConfigsCollapsible.vue";
import { fitGraphId } from "@/store/graphs/state";
import selectVariables from "@/components/mixins/selectVariables";

describe("OptionsTab", () => {
    const mockTooltipDirective = vi.fn();

    const getWrapper = (store: Store<any>) => {
        return mount(OptionsTab, {
            global: {
                plugins: [store],
                directives: { tooltip: mockTooltipDirective }
            }
        });
    };

    const fitAppState = {
        appType: AppType.Fit,
        openVisualisationTab: VisualisationTab.Run,
        model: {},
        run: mockRunState({
            parameterValues: {}
        }),
        modelFit: {
            paramsToVary: []
        },
        sensitivity: {
            paramSettings: {}
        },
        graphs: {
            settings: {
                logScaleYAxis: false
            }
        }
    } as any;

    it("renders as expected for Basic app", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                appType: AppType.Basic,
                openVisualisationTab: VisualisationTab.Run,
                model: mockModelState(),
                graphs: {
                    settings: {
                        logScaleYAxis: false
                    }
                }
            } as any,
            modules: {
                run: {
                    namespaced: true,
                    state: mockRunState({
                        parameterValues: { param1: 1, param2: 2.2 }
                    }),
                    getters: runGetters
                }
            }
        });
        const wrapper = getWrapper(store);
        const collapses = wrapper.findAllComponents(VerticalCollapse);
        expect(collapses.length).toBe(4);
        expect(collapses.at(0)!.props("title")).toBe("Model Parameters");
        expect(collapses.at(0)!.props("collapseId")).toBe("model-params");
        const paramValues = collapses.at(0)!.findComponent(ParameterValues);
        expect(paramValues.exists()).toBe(true);
        expect(collapses.at(1)!.props("title")).toBe("Run Options");
        expect(collapses.at(1)!.props("collapseId")).toBe("run-options");
        expect(collapses.at(1)!.findComponent(RunOptions).exists()).toBe(true);
        expect(collapses.at(2)!.props("title")).toBe("Advanced Settings");
        expect(collapses.at(2)!.props("collapseId")).toBe("advanced-settings");
        expect(collapses.at(2)!.props("collapsedDefault")).toBe(true);
        expect(collapses.at(2)!.findComponent(AdvancedSettings).exists()).toBe(true);
        expect(collapses.at(3)!.props("title")).toBe("Saved Parameter Sets");
        expect(collapses.at(3)!.props("collapseId")).toBe("parameter-sets");
        expect(collapses.at(3)!.findComponent(ParameterSets).exists()).toBe(true);
        expect(wrapper.find("#reset-params-btn").exists()).toBe(true);
        expect(wrapper.find("#reset-params-btn").text()).toBe("Reset");
        expect(wrapper.findComponent(GraphConfigsCollapsible).exists()).toBe(true);
    });

    it("can reset model parameters", async () => {
        const mockUpdateParameterValuesMutation = vi.fn();
        const store = new Vuex.Store<BasicState>({
            state: {
                appType: AppType.Basic,
                openVisualisationTab: VisualisationTab.Run,
                graphs: {
                    settings: {
                        logScaleYAxis: false
                    }
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
                model: {},
                modelFit: {
                    paramsToVary: []
                },
                fitData: {
                    columnToFit: null
                },
                graphs: {
                    fitGraphConfig: {
                        id: fitGraphId,
                        selectVariables: [],
                        unselectedVariables: [],
                        settings: {
                            logScaleYAxis: false
                        }
                    }
                }
            } as any,
            modules: {
                run: {
                    namespaced: true,
                    state: mockRunState({
                        parameterValues: { param1: 1, param2: 2.2 }
                    }),
                    getters: runGetters
                }
            }
        });
        const wrapper = getWrapper(store);

        const collapses = wrapper.findAllComponents(VerticalCollapse);
        expect(collapses.length).toBe(6);
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
        expect(collapses.at(3)!.findComponent(OptimisationOptions).exists()).toBe(true);
        expect(collapses.at(4)!.props("title")).toBe("Advanced Settings");
        expect(collapses.at(4)!.props("collapseId")).toBe("advanced-settings");
        expect(collapses.at(4)!.props("collapsedDefault")).toBe(true);
        expect(collapses.at(4)!.findComponent(AdvancedSettings).exists()).toBe(true);
        expect(collapses.at(5)!.props("title")).toBe("Saved Parameter Sets");
        expect(collapses.at(5)!.props("collapseId")).toBe("parameter-sets");
        expect(collapses.at(5)!.findComponent(ParameterSets).exists()).toBe(true);

        const graphConfigCollapse = wrapper.findAllComponents(GraphConfigsCollapsible);
        expect(graphConfigCollapse.length).toBe(1);

        expect(wrapper.find("#reset-params-btn").exists()).toBe(true);
        expect(wrapper.find("#reset-params-btn").text()).toBe("Reset");
    });

    it("renders as expected for Stochastic app", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                appType: AppType.Stochastic,
                openVisualisationTab: VisualisationTab.Run,
                model: mockModelState(),
                run: mockRunState({
                    parameterValues: { param1: 1, param2: 2.2 }
                }),
                graphs: {
                    settings: {
                        logScaleYAxis: false
                    }
                }
            } as any
        });
        const wrapper = getWrapper(store);
        const collapses = wrapper.findAllComponents(VerticalCollapse);
        expect(collapses.length).toBe(2);
        expect(collapses.at(0)!.props("title")).toBe("Model Parameters");
        expect(collapses.at(0)!.props("collapseId")).toBe("model-params");
        const paramValues = collapses.at(0)!.findComponent(ParameterValues);
        expect(paramValues.exists()).toBe(true);
        expect(collapses.at(1)!.props("title")).toBe("Run Options");
        expect(collapses.at(1)!.props("collapseId")).toBe("run-options");
        expect(collapses.at(1)!.findComponent(RunOptions).exists()).toBe(true);
        expect(wrapper.find("#reset-params-btn").exists()).toBe(true);
        expect(wrapper.find("#reset-params-btn").text()).toBe("Reset");
    });

    it("renders as expected when sensitivity tab is not open", () => {
        const store = new Vuex.Store<FitState>({
            state: fitAppState,
            modules: {
                run: {
                    namespaced: true,
                    state: fitAppState.run,
                    getters: runGetters
                }
            }
        });
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(SensitivityOptions).exists()).toBe(false);
    });

    it("renders as expected when sensitivity tab is open", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                ...fitAppState,
                openVisualisationTab: VisualisationTab.Sensitivity
            },
            modules: {
                run: {
                    namespaced: true,
                    state: mockRunState({
                        parameterValues: { param1: 1, param2: 2.2 }
                    }),
                    getters: runGetters
                },
                multiSensitivity: {
                    namespaced: true,
                    state: {
                        paramSettings: []
                    }
                },
                sensitivity: {
                    namespaced: true,
                    state: {
                        paramSettings: []
                    }
                }
            }
        });
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(SensitivityOptions).exists()).toBe(true);
        expect(wrapper.find("#reset-params-btn").exists()).toBe(true);
        expect(wrapper.find("#reset-params-btn").text()).toBe("Reset");
    });

    it("renders as expected when multi-sensitivity tab is open", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                ...fitAppState,
                openVisualisationTab: VisualisationTab.MultiSensitivity
            },
            modules: {
                run: {
                    namespaced: true,
                    state: mockRunState({
                        parameterValues: { param1: 1, param2: 2.2 }
                    }),
                    getters: runGetters
                }
            }
        });
        const wrapper = shallowMount(OptionsTab, {
            global: {
                plugins: [store],
                directives: { tooltip: mockTooltipDirective }
            }
        });
        expect(wrapper.findComponent(SensitivityOptions).exists()).toBe(true);
        expect(wrapper.findComponent(GraphSettings).exists()).toBe(false);
    });
});
