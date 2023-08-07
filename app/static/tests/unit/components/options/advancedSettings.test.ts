import { VueWrapper, shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import AdvancedSettings from "../../../../src/app/components/options/AdvancedSettings.vue";
import { mockRunState } from "../../../mocks";
import { RunMutation } from "../../../../src/app/store/run/mutations";
import NumericInput from "../../../../src/app/components/options/NumericInput.vue";
import StandardFormInput from "../../../../src/app/components/options/StandardFormInput.vue";
import { AdvancedOptions } from "../../../../src/app/types/responseTypes";

describe("Advanced Settings", () => {
    const mockUpdateAdvancedSettings = jest.fn();

    const getWrapper = () => {
        const store = new Vuex.Store({
            modules: {
                run: {
                    namespaced: true,
                    state: mockRunState(),
                    mutations: {
                        [RunMutation.UpdateAdvancedSettings]: mockUpdateAdvancedSettings
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
        jest.resetAllMocks();
    });

    const expectValueAndPlaceholder = (
        input: VueWrapper<any>,
        value: number | null | (number|null)[],
        defaults: number | number[]
    ) => {
        expect(input.props("value")).toStrictEqual(value);
        expect(input.props("placeholder")).toStrictEqual(defaults);
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();

        const inputs = wrapper.findAllComponents(NumericInput);
        expect(inputs.length).toBe(3);
        const standardFormInputs = wrapper.findAllComponents(StandardFormInput);
        expect(standardFormInputs.length).toBe(2);
        const labels = wrapper.findAll("label");
        expect(labels.length).toBe(5);

        expect(labels[0].text()).toBe("Tolerance");
        expectValueAndPlaceholder(standardFormInputs[0], [null, null], [1, -6]);
        expect(labels[1].text()).toBe("Max steps");
        expectValueAndPlaceholder(inputs[0], null, 10000);
        expect(labels[2].text()).toBe("Max step size");
        expectValueAndPlaceholder(inputs[1], null, Infinity);
        expect(labels[3].text()).toBe("Min step size");
        expectValueAndPlaceholder(standardFormInputs[1], [null, null], [1, -8]);
        expect(labels[4].text()).toBe("Critical time");
        expectValueAndPlaceholder(inputs[2], null, Infinity);
    });

    it("commits update advanced settings without standard form", () => {
        const wrapper = getWrapper();

        const inputs = wrapper.findAllComponents(NumericInput);
        inputs[0].vm.$emit("update", 2);

        expect(mockUpdateAdvancedSettings).toBeCalledTimes(1);
        expect(mockUpdateAdvancedSettings.mock.calls[0][1])
            .toStrictEqual({ newVal: 2, option: AdvancedOptions.maxSteps });
    });

    it("commits update advanced settings with standard form", () => {
        const wrapper = getWrapper();

        const inputs = wrapper.findAllComponents(StandardFormInput);
        inputs[0].vm.$emit("update", [2, 3]);

        expect(mockUpdateAdvancedSettings).toBeCalledTimes(1);
        expect(mockUpdateAdvancedSettings.mock.calls[0][1])
            .toStrictEqual({ newVal: [2, 3], option: AdvancedOptions.tol });
    });
});
