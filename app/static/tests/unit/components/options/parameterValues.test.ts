import Vuex, { Store } from "vuex";
import { nextTick } from "vue";
import { mount, shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import ParameterValues from "../../../../src/app/components/options/ParameterValues.vue";
import NumericInput from "../../../../src/app/components/options/NumericInput.vue";
import { mockBasicState, mockModelFitState, mockModelState, mockRunState } from "../../../mocks";
import { RunMutation, mutations as runMutations } from "../../../../src/app/store/run/mutations";
import { AppType, VisualisationTab } from "../../../../src/app/store/appState/state";
import Mock = jest.Mock;
import { ModelFitMutation } from "../../../../src/app/store/modelFit/mutations";
import { BaseSensitivityMutation, SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";
import { ModelState } from "../../../../src/app/store/model/state";

const mockTooltipDirective = jest.fn();

describe("ParameterValues", () => {
    const getStore = (
        fitTabIsOpen = false,
        mockUpdateParameterValues: Mock<any, any> | null = null,
        mockSetSensitivityUpdateRequired = jest.fn(),
        mockSetMultiSensitivityUpdateRequired = jest.fn(),
        mockSetFitUpdateRequired = jest.fn(),
        paramsToVary: string[] = [],
        mockSetParamsToVary = jest.fn(),
        modelState: Partial<ModelState> = {},
        appType: AppType = AppType.Fit,
        multiSensitivityEnabled = false
    ) => {
        // Use mock or real mutations
        const storeMutations = mockUpdateParameterValues
            ? { UpdateParameterValues: mockUpdateParameterValues }
            : runMutations;

        const store = new Vuex.Store<BasicState>({
            state: {
                appType,
                config: {
                    multiSensitivity: multiSensitivityEnabled
                },
                openVisualisationTab: fitTabIsOpen ? VisualisationTab.Fit : VisualisationTab.Run
            } as any,
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState(modelState)
                },
                run: {
                    namespaced: true,
                    state: mockRunState({
                        parameterValues: { param1: 1, param2: 2.2 }
                    }),
                    mutations: storeMutations
                },
                modelFit: {
                    namespaced: true,
                    state: mockModelFitState({ paramsToVary }),
                    mutations: {
                        [ModelFitMutation.SetParamsToVary]: mockSetParamsToVary,
                        [ModelFitMutation.SetFitUpdateRequired]: mockSetFitUpdateRequired
                    }
                },
                sensitivity: {
                    namespaced: true,
                    mutations: {
                        [BaseSensitivityMutation.SetUpdateRequired]: mockSetSensitivityUpdateRequired
                    }
                },
                multiSensitivity: {
                    namespaced: true,
                    mutations: {
                        [BaseSensitivityMutation.SetUpdateRequired]: mockSetMultiSensitivityUpdateRequired
                    }
                }
            }
        });
        return store;
    };

    const getWrapper = (store: Store<BasicState>) => {
        return shallowMount(ParameterValues, {
            global: {
                plugins: [store],
                directives: { tooltip: mockTooltipDirective }
            }
        });
    };

    it("renders as expected when fit tab is not open", () => {
        const wrapper = getWrapper(getStore());
        const rows = wrapper.findAll("div.row");

        const p1 = rows.at(0)!;
        expect(p1.find("label").text()).toBe("param1");
        const input1 = p1.findComponent(NumericInput);
        expect(input1.props("value")).toBe(1);
        expect(p1.find("input.vary-param-check").exists()).toBe(false);

        const p2 = rows.at(1)!;
        expect(p2.find("label").text()).toBe("param2");
        const input2 = p2.findComponent(NumericInput);
        expect(input2.props("value")).toBe(2.2);
        expect(p2.find("input.vary-param-check").exists()).toBe(false);

        expect(wrapper.find("#select-param-msg").text()).toBe("");
    });

    it("renders as expected when fit tab is open", () => {
        const wrapper = getWrapper(getStore(true, null, jest.fn(), jest.fn(), jest.fn(), ["param1"]));
        const rows = wrapper.findAll("div.row");

        const p1 = rows.at(0)!;
        expect(p1.find("label").text()).toBe("param1");
        const input1 = p1.findComponent(NumericInput);
        expect(input1.props("value")).toBe(1);
        expect(p1.find("input.vary-param-check").exists()).toBe(true);
        expect((p1.find("input.vary-param-check").element as HTMLInputElement).checked).toBe(true);

        const p2 = rows.at(1)!;
        expect(p2.find("label").text()).toBe("param2");
        const input2 = p2.findComponent(NumericInput);
        expect(input2.props("value")).toBe(2.2);
        expect((p2.find("input.vary-param-check").element as HTMLInputElement).checked).toBe(false);

        expect(wrapper.find("#select-param-msg").text()).toBe("");
    });

    it("shows select param to vary message if fit tab is open and none are selected", () => {
        const wrapper = getWrapper(getStore(true, null, jest.fn(), jest.fn(), jest.fn(), []));
        expect(wrapper.find("#select-param-msg").text()).toBe(
            "Please select at least one parameter to vary during model fit."
        );
    });

    it("resets parameters", async () => {
        const modelState = {
            odinModelResponse: {
                metadata: {
                    parameters: [
                        { name: "param1", default: 1 },
                        { name: "param2", default: 5.5 }
                    ]
                }
            } as any
        };
        const mockUpdateParameterValues = jest.fn();
        const wrapper = getWrapper(
            getStore(false, mockUpdateParameterValues, jest.fn(), jest.fn(), jest.fn(), [], jest.fn(), modelState)
        );
        const input2 = wrapper.findAllComponents(NumericInput).at(1)!;
        await input2.vm.$emit("update", 3.3);
        expect(input2.props("value")).toBe(2.2);
        expect(mockUpdateParameterValues).toHaveBeenCalledTimes(1);
        expect(mockUpdateParameterValues.mock.calls[0][1]).toStrictEqual({ param2: 3.3 });
        const reset = wrapper.find("#reset-params-btn");
        await reset.trigger("click");
        expect(mockUpdateParameterValues).toHaveBeenCalledTimes(2);
        expect(mockUpdateParameterValues.mock.calls[1][1]).toStrictEqual({ param2: 5.5 });
    });

    it("does not show resets button when there are no parameters", async () => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState,
            modules: {
                run: {
                    namespaced: true,
                    state: mockRunState({
                        parameterValues: {}
                    })
                }
            }
        });
        const wrapper = getWrapper(store);
        const reset = wrapper.find("#reset-params-btn");
        expect(reset.exists()).toBe(false);
    });

    it("does not resets parameters to default values if no changes", async () => {
        const modelState = {
            odinModelResponse: {
                metadata: {
                    parameters: [
                        { name: "param1", default: 1 },
                        { name: "param2", default: 2.2 }
                    ]
                }
            } as any
        };
        const mockUpdateParameterValues = jest.fn();
        const wrapper = getWrapper(
            getStore(false, mockUpdateParameterValues, jest.fn(), jest.fn(), jest.fn(), [], jest.fn(), modelState)
        );
        const reset = wrapper.find("#reset-params-btn");
        await reset.trigger("click");
        expect(mockUpdateParameterValues).toHaveBeenCalledTimes(0);
    });

    it("commits parameter value change", async () => {
        const mockUpdateParameterValues = jest.fn();
        const mockSetSensitivityUpdateRequired = jest.fn();
        const mockSetMultiSensitivityUpdateRequired = jest.fn();
        const mockSetFitUpdateRequired = jest.fn();
        const wrapper = getWrapper(
            getStore(
                false,
                mockUpdateParameterValues,
                mockSetSensitivityUpdateRequired,
                mockSetMultiSensitivityUpdateRequired,
                mockSetFitUpdateRequired
            )
        );
        const input2 = wrapper.findAllComponents(NumericInput).at(1)!;
        await input2.vm.$emit("update", 3.3);
        expect(mockUpdateParameterValues).toHaveBeenCalledTimes(1);
        expect(mockUpdateParameterValues.mock.calls[0][1]).toStrictEqual({ param2: 3.3 });
        expect(mockSetSensitivityUpdateRequired).toHaveBeenCalledTimes(1);
        expect(mockSetSensitivityUpdateRequired.mock.calls[0][1]).toStrictEqual({ parameterValueChanged: true });
        expect(mockSetMultiSensitivityUpdateRequired).not.toHaveBeenCalled();
        expect(mockSetFitUpdateRequired).toHaveBeenCalledTimes(1);
        expect(mockSetFitUpdateRequired.mock.calls[0][1]).toStrictEqual({ parameterValueChanged: true });
    });

    it("parameter value change set multiSensitivity update required when multiSensitivity is enabled", async () => {
        const mockUpdateParameterValues = jest.fn();
        const mockSetSensitivityUpdateRequired = jest.fn();
        const mockSetMultiSensitivityUpdateRequired = jest.fn();
        const mockSetFitUpdateRequired = jest.fn();
        const store = getStore(
            false,
            mockUpdateParameterValues,
            mockSetSensitivityUpdateRequired,
            mockSetMultiSensitivityUpdateRequired,
            mockSetFitUpdateRequired,
            [],
            jest.fn(),
            {},
            AppType.Fit,
            true
        );
        const wrapper = getWrapper(store);
        const input2 = wrapper.findAllComponents(NumericInput).at(1)!;
        await input2.vm.$emit("update", 3.3);
        expect(mockUpdateParameterValues).toHaveBeenCalledTimes(1);
        expect(mockSetSensitivityUpdateRequired).toHaveBeenCalledTimes(1);
        expect(mockSetSensitivityUpdateRequired.mock.calls[0][1]).toStrictEqual({ parameterValueChanged: true });
        expect(mockSetMultiSensitivityUpdateRequired).toHaveBeenCalledTimes(1);
        expect(mockSetMultiSensitivityUpdateRequired.mock.calls[0][1]).toStrictEqual({ parameterValueChanged: true });
        expect(mockSetFitUpdateRequired).toHaveBeenCalledTimes(1);
        expect(mockSetFitUpdateRequired.mock.calls[0][1]).toStrictEqual({ parameterValueChanged: true });
    });

    it("value change does not SetFitUpdateRequired if not Fit app", async () => {
        const mockUpdateParameterValues = jest.fn();
        const mockSetSensitivityUpdateRequired = jest.fn();
        const mockSetFitUpdateRequired = jest.fn();
        const store = getStore(
            false,
            mockUpdateParameterValues,
            mockSetSensitivityUpdateRequired,
            jest.fn(),
            mockSetFitUpdateRequired,
            [],
            jest.fn(),
            {},
            AppType.Basic
        );
        const wrapper = getWrapper(store);
        const input2 = wrapper.findAllComponents(NumericInput).at(1)!;
        await input2.vm.$emit("update", 3.3);
        expect(mockUpdateParameterValues).toHaveBeenCalledTimes(1);
        expect(mockSetSensitivityUpdateRequired).toHaveBeenCalledTimes(1);
        expect(mockSetFitUpdateRequired).not.toHaveBeenCalled();
    });

    it("refreshes cleared input when odinSolution changes", async () => {
        const store = getStore();
        const wrapper = mount(ParameterValues, {
            global: {
                plugins: [store],
                directives: { tooltip: mockTooltipDirective }
            }
        });
        wrapper.findAll("input").at(1)!.setValue("");

        store.commit(`run/${RunMutation.SetResultOde}`, { solution: {} });
        await nextTick();
        expect(wrapper.findAllComponents(NumericInput).at(1)!.props("value")).toBe(2.2);
        expect((wrapper.findAll("input").at(1)!.element as HTMLInputElement).value).toBe("2.2");
    });

    it("updates params to vary when checkbox is checked", async () => {
        const mockSetParamsToVary = jest.fn();
        const mockSetFitUpdateRequired = jest.fn();
        const store = getStore(
            true,
            null,
            jest.fn(),
            jest.fn(),
            mockSetFitUpdateRequired,
            ["param1"],
            mockSetParamsToVary
        );
        const wrapper = getWrapper(store);
        const row2 = wrapper.findAll("div.row").at(1)!;
        await row2.find("input.vary-param-check").setValue(true);
        expect(mockSetParamsToVary).toHaveBeenCalledTimes(1);
        expect(mockSetParamsToVary.mock.calls[0][1]).toStrictEqual(["param1", "param2"]);
        expect(mockSetFitUpdateRequired).toHaveBeenCalledTimes(1);
        expect(mockSetFitUpdateRequired.mock.calls[0][1]).toStrictEqual({ parameterToVaryChanged: true });
    });

    it("updates params to vary when checkbox is unchecked", async () => {
        const mockSetParamsToVary = jest.fn();
        const mockSetFitUpdateRequired = jest.fn();
        const store = getStore(
            true,
            null,
            jest.fn(),
            jest.fn(),
            mockSetFitUpdateRequired,
            ["param1"],
            mockSetParamsToVary
        );
        const wrapper = getWrapper(store);
        const row1 = wrapper.findAll("div.row").at(0)!;
        await row1.find("input.vary-param-check").setValue(false);
        expect(mockSetParamsToVary).toHaveBeenCalledTimes(1);
        expect(mockSetParamsToVary.mock.calls[0][1]).toStrictEqual([]);
        expect(mockSetFitUpdateRequired).toHaveBeenCalledTimes(1);
        expect(mockSetFitUpdateRequired.mock.calls[0][1]).toStrictEqual({ parameterToVaryChanged: true });
    });
});
