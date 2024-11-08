import { VueWrapper, shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import AdvancedSettings from "../../../../src/components/options/AdvancedSettings.vue";
import { mockModelFitState, mockRunState, mockSensitivityState } from "../../../mocks";
import { RunMutation } from "../../../../src/store/run/mutations";
import NumericInput from "../../../../src/components/options/NumericInput.vue";
import StandardFormInput from "../../../../src/components/options/StandardFormInput.vue";
import { AdvancedOptions } from "../../../../src/types/responseTypes";
import TagInput from "../../../../src/components/options/TagInput.vue";
import { ModelFitMutation } from "../../../../src/store/modelFit/mutations";
import { BaseSensitivityMutation } from "../../../../src/store/sensitivity/mutations";
import { AppType } from "../../../../src/store/appState/state";

describe("Advanced Settings", () => {
    const mockUpdateAdvancedSettings = vi.fn();
    const mockSetFitUpdateRequired = vi.fn();
    const mockSetSensitivityUpdateRequired = vi.fn();
    const mockSetMultiSensitivityUpdateRequired = vi.fn();

    const getWrapper = (isFit = false, multiSensitivity = false) => {
        const store = new Vuex.Store({
            state: {
                appType: isFit ? AppType.Fit : AppType.Basic,
                config: {
                    multiSensitivity
                }
            },
            modules: {
                run: {
                    namespaced: true,
                    state: mockRunState(),
                    mutations: {
                        [RunMutation.UpdateAdvancedSettings]: mockUpdateAdvancedSettings
                    }
                },
                modelFit: {
                    namespaced: true,
                    state: mockModelFitState(),
                    mutations: {
                        [ModelFitMutation.SetFitUpdateRequired]: mockSetFitUpdateRequired
                    }
                },
                sensitivity: {
                    namespaced: true,
                    state: mockSensitivityState(),
                    mutations: {
                        [BaseSensitivityMutation.SetUpdateRequired]: mockSetSensitivityUpdateRequired
                    }
                },
                multiSensitivity: {
                    namespaced: true,
                    state: {},
                    mutations: {
                        [BaseSensitivityMutation.SetUpdateRequired]: mockSetMultiSensitivityUpdateRequired
                    }
                }
            }
        });
        return shallowMount(AdvancedSettings, {
            global: {
                plugins: [store]
            }
        });
    };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    const expectValueAndPlaceholder = (
        input: VueWrapper<any>,
        value: number | null | (number | null)[],
        defaults: number | number[] | string
    ) => {
        expect(input.props("value")).toStrictEqual(value);
        expect(input.props("placeholder")).toStrictEqual(defaults);
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();

        const inputs = wrapper.findAllComponents(NumericInput);
        expect(inputs.length).toBe(2);
        const standardFormInputs = wrapper.findAllComponents(StandardFormInput);
        expect(standardFormInputs.length).toBe(2);
        const tagsInput = wrapper.findAllComponents(TagInput);
        expect(tagsInput.length).toBe(1);
        const labels = wrapper.findAll("label");
        expect(labels.length).toBe(5);

        expect(labels[0].text()).toBe("Tolerance");
        expectValueAndPlaceholder(standardFormInputs[0], [null, null], [1, -6]);
        expect(labels[1].text()).toBe("Max steps");
        expectValueAndPlaceholder(inputs[0], null, 10000);
        expect(labels[2].text()).toBe("Max step size");
        expectValueAndPlaceholder(inputs[1], null, "");
        expect(labels[3].text()).toBe("Min step size");
        expectValueAndPlaceholder(standardFormInputs[1], [null, null], [1, -8]);
        expect(labels[4].text()).toBe("Critical times");
        expect(tagsInput[0].props("tags")).toBe(null);
    });

    it("commits update advanced settings without standard form", () => {
        const wrapper = getWrapper();

        const inputs = wrapper.findAllComponents(NumericInput);
        inputs[0].vm.$emit("update", 2);

        expect(mockUpdateAdvancedSettings).toBeCalledTimes(1);
        expect(mockUpdateAdvancedSettings.mock.calls[0][1]).toStrictEqual({
            newVal: 2,
            option: AdvancedOptions.maxSteps
        });
    });

    it("commits update advanced settings with standard form", () => {
        const wrapper = getWrapper();

        const inputs = wrapper.findAllComponents(StandardFormInput);
        inputs[0].vm.$emit("update", [2, 3]);

        expect(mockUpdateAdvancedSettings).toBeCalledTimes(1);
        expect(mockUpdateAdvancedSettings.mock.calls[0][1]).toStrictEqual({
            newVal: [2, 3],
            option: AdvancedOptions.tol
        });
    });

    it("commits update required to both fit and sensitivity when on fit app", () => {
        const wrapper = getWrapper(true);

        const inputs = wrapper.findAllComponents(NumericInput);
        inputs[0].vm.$emit("update", 2);

        expect(mockUpdateAdvancedSettings).toBeCalledTimes(1);
        expect(mockSetFitUpdateRequired).toBeCalledTimes(1);
        expect(mockSetSensitivityUpdateRequired).toBeCalledTimes(1);
        expect(mockSetMultiSensitivityUpdateRequired).toBeCalledTimes(0);
    });

    it("commits update required to only sensitivity when not on fit app", () => {
        const wrapper = getWrapper();

        const inputs = wrapper.findAllComponents(NumericInput);
        inputs[0].vm.$emit("update", 2);

        expect(mockUpdateAdvancedSettings).toBeCalledTimes(1);
        expect(mockSetFitUpdateRequired).toBeCalledTimes(0);
        expect(mockSetSensitivityUpdateRequired).toBeCalledTimes(1);
        expect(mockSetMultiSensitivityUpdateRequired).toBeCalledTimes(0);
    });

    it("commits update required to multiSensitivity", () => {
        const wrapper = getWrapper(true, true);

        const inputs = wrapper.findAllComponents(NumericInput);
        inputs[0].vm.$emit("update", 2);

        expect(mockUpdateAdvancedSettings).toBeCalledTimes(1);
        expect(mockSetFitUpdateRequired).toBeCalledTimes(1);
        expect(mockSetSensitivityUpdateRequired).toBeCalledTimes(1);
        expect(mockSetMultiSensitivityUpdateRequired).toBeCalledTimes(1);
    });
});
