import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import GraphSettings from "../../../../src/app/components/options/GraphSettings.vue";
import { GraphSettingsMutation } from "../../../../src/app/store/graphSettings/mutations";

describe("GraphSettings", () => {
    const mockSetLogScaleYAxis = jest.fn();
    const mockSetLockYAxis = jest.fn();

    const getWrapper = (logScaleYAxis = true, lockYAxis = true) => {
        const store = new Vuex.Store<BasicState>({
            modules: {
                graphSettings: {
                    namespaced: true,
                    state: {
                        logScaleYAxis,
                        lockYAxis
                    } as any,
                    mutations: {
                        [GraphSettingsMutation.SetLogScaleYAxis]: mockSetLogScaleYAxis,
                        [GraphSettingsMutation.SetLockYAxis]: mockSetLockYAxis
                    }
                }
            }
        });
        return shallowMount(GraphSettings, {
            global: {
                plugins: [store]
            }
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders as expected", () => {
        const wrapper = getWrapper();
        const labels = wrapper.findAll("label");
        const inputs = wrapper.findAll("input");
        expect(labels.length).toBe(2);
        expect(inputs.length).toBe(2);
        expect(labels[0].text()).toBe("Log scale y axis");
        expect(inputs[0].attributes("type")).toBe("checkbox");
        expect((inputs[0].element as HTMLInputElement).checked).toBe(true);
        expect(labels[1].text()).toBe("Lock axes");
        expect(inputs[1].attributes("type")).toBe("checkbox");
        expect((inputs[1].element as HTMLInputElement).checked).toBe(true);
    });

    it("commits change to log scale y axis setting", async () => {
        const wrapper = getWrapper(false);
        const inputs = wrapper.findAll("input");
        expect((inputs[0].element as HTMLInputElement).checked).toBe(false);
        await inputs[0].setValue(true);
        expect(mockSetLogScaleYAxis).toHaveBeenCalledTimes(1);
        expect(mockSetLogScaleYAxis.mock.calls[0][1]).toBe(true);
    });

    it("commits change to log scale y axis setting", async () => {
        const wrapper = getWrapper(false, false);
        const inputs = wrapper.findAll("input");
        expect((inputs[1].element as HTMLInputElement).checked).toBe(false);
        await inputs[1].setValue(true);
        expect(mockSetLockYAxis).toHaveBeenCalledTimes(1);
        expect(mockSetLockYAxis.mock.calls[0][1]).toBe(true);
    });
});
