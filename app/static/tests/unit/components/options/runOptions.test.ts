import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import { FitDataGetter } from "../../../../src/app/store/fitData/getters";
import RunOptions from "../../../../src/app/components/options/RunOptions.vue";
import NumericInput from "../../../../src/app/components/options/NumericInput.vue";
import { AppType } from "../../../../src/app/store/appState/state";

describe("RunOptions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockSensitivitySetEndTime = jest.fn();
    const mockRunSetEndTime = jest.fn();
    const mockSetSensitivityUpdateRequired = jest.fn();
    const mockNumberOfReplicates = jest.fn();

    const getWrapper = (mockDataEnd: number | null = 0, states = {}) => {
        const modules = {
            run: {
                namespaced: true,
                state: {
                    endTime: 99
                },
                mutations: {
                    SetEndTime: mockRunSetEndTime,
                    SetNumberOfReplicates: mockNumberOfReplicates
                }
            },
            sensitivity: {
                namespaced: true,
                mutations: {
                    SetUpdateRequired: mockSetSensitivityUpdateRequired,
                    SetEndTime: mockSensitivitySetEndTime
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
            state: {
                ...states
            } as any,
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
        const wrapper = getWrapper(10);
        const labels = wrapper.findAll("label");
        expect(labels.length).toBe(2);
        expect(labels[0].text()).toBe("End time");
        expect(labels[1].text()).toBe("10 (from data)");
    });

    it("renders as expected when no fitData module present", () => {
        const wrapper = getWrapper(null);
        expect(wrapper.find("label").text()).toBe("End time");
        const input = wrapper.findComponent(NumericInput);
        expect(input.props("value")).toBe(99);
        expect(input.props("allowNegative")).toBe(false);
    });

    it("commits end time change", () => {
        const wrapper = getWrapper(0);
        const endTime = wrapper.find("#end-time");
        endTime.findComponent(NumericInput).vm.$emit("update", 101);
        expect(mockRunSetEndTime).toHaveBeenCalledTimes(1);
        expect(mockRunSetEndTime.mock.calls[0][1]).toBe(101);
        expect(mockSensitivitySetEndTime).toHaveBeenCalledTimes(1);
        expect(mockSensitivitySetEndTime.mock.calls[0][1]).toBe(101);
    });

    it("can render and update number of replicates", async () => {
        const wrapper = getWrapper(0, { appType: `${AppType.Stochastic }`});
        const noOfReplicates = wrapper.find("#number-of-replicates");
        noOfReplicates.findComponent(NumericInput).vm.$emit("update", 20);
        expect(mockNumberOfReplicates.mock.calls[0][1]).toBe(20);
        expect(noOfReplicates.text()).toBe("Number of replicates");
    });

    it("does not render number of replicates when app is not stochastic", () => {
        const wrapper = getWrapper(0, { appType: `${AppType.Basic}` });
        const labels = wrapper.findAll("label");
        expect(labels.length).toBe(1);
        expect(labels[0].text()).toBe("End time");
    });
});
