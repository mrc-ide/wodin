import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import { FitDataGetter } from "../../../../src/app/store/fitData/getters";
import RunOptions from "../../../../src/app/components/options/RunOptions.vue";
import NumericInput from "../../../../src/app/components/options/NumericInput.vue";

describe("RunOptions", () => {
    const getWrapper = (mockSetEndTime = jest.fn(), mockSetSensitivityUpdateRequired = jest.fn(),
        mockDataEnd: number | null = 0) => {
        const modules = {
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
        } as any;
        if (mockDataEnd !== null) {
            modules.fitData = {
                namespaced: true,
                getters: {
                    [FitDataGetter.dataEnd]: () => mockDataEnd
                }
            };
        }
        const store = new Vuex.Store<BasicState>({
            state: {} as any,
            modules
        });
        return shallowMount(RunOptions, {
            global: {
                plugins: [store]
            }
        });
    };

    it("renders as expected when no data present", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("label").text()).toBe("End time");
        const input = wrapper.findComponent(NumericInput);
        expect(input.props("value")).toBe(99);
        expect(input.props("allowNegative")).toBe(false);
    });

    it("renders as expected when data present", () => {
        const wrapper = getWrapper(jest.fn(), jest.fn(), 10);
        const labels = wrapper.findAll("label");
        expect(labels.length).toBe(2);
        expect(labels[0].text()).toBe("End time");
        expect(labels[1].text()).toBe("10 (from data)");
    });

    it("renders as expected when no fitData module present", () => {
        const wrapper = getWrapper(jest.fn(), jest.fn(), null);
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
        expect(mockSetSensitivityUpdateRequired.mock.calls[0][1]).toStrictEqual({ endTimeChanged: true });
    });
});
