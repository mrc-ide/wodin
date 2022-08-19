import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import RunOptions from "../../../../src/app/components/options/RunOptions.vue";
import NumericInput from "../../../../src/app/components/options/NumericInput.vue";

describe("RunOptions", () => {
    const getWrapper = (mockSetEndTime = jest.fn(), mockSetSensitivityUpdateRequired = jest.fn()) => {
        const store = new Vuex.Store<BasicState>({
            state: {} as any,
            modules: {
                run: {
                    namespaced: true,
                    state: {
                        endTime: 99
                    },
                    mutations: {
                        SetEndTime: mockSetEndTime
                    }
                },
                sensitivity: {
                    namespaced: true,
                    mutations: {
                        SetUpdateRequired: mockSetSensitivityUpdateRequired
                    }
                }
            }
        });
        return shallowMount(RunOptions, {
            global: {
                plugins: [store]
            }
        });
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("label").text()).toBe("End time");
        const input = wrapper.findComponent(NumericInput);
        expect(input.props("value")).toBe(99);
        expect(input.props("allowNegative")).toBe(false);
    });

    it("commits end time change", () => {
        const mockSetEndTime = jest.fn();
        const mockSetSensitivityUpdateRequired = jest.fn();
        const wrapper = getWrapper(mockSetEndTime, mockSetSensitivityUpdateRequired);
        const input = wrapper.findComponent(NumericInput);
        input.vm.$emit("update", 101);
        expect(mockSetEndTime).toHaveBeenCalledTimes(1);
        expect(mockSetEndTime.mock.calls[0][1]).toBe(101);
        expect(mockSetSensitivityUpdateRequired).toHaveBeenCalledTimes(1);
        expect(mockSetSensitivityUpdateRequired.mock.calls[0][1]).toBe(true);
    });
});
