import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../src/app/store/basic/state";
import GraphSettings from "../../../src/app/components/GraphSettings.vue";
import { GraphsMutation } from "../../../src/app/store/graphs/mutations";
import {defaultGraphSettings} from "../../../src/app/store/graphs/state";

describe("GraphSettings", () => {
    const mockSetLogScaleYAxis = jest.fn();
    const mockSetLockYAxis = jest.fn();

    const mockSetFitLogScaleYAxis = jest.fn();
    const mockSetFitLockYAxis = jest.fn();

    const getWrapper = (
        graphIndex: number | undefined = 1,
        fitPlot = false,
        graphSettings = [defaultGraphSettings(), defaultGraphSettings()],
        fitGraphSettings = defaultGraphSettings()
    ) => {
        const store = new Vuex.Store<BasicState>({
            modules: {
                graphs: {
                    namespaced: true,
                    state: {
                        fitGraphSettings,
                        config: graphSettings.map((settings) => ({ settings }))
                    } as any,
                    mutations: {
                        [GraphsMutation.SetLogScaleYAxis]: mockSetLogScaleYAxis,
                        [GraphsMutation.SetLockYAxis]: mockSetLockYAxis,
                        [GraphsMutation.SetFitLogScaleYAxis]: mockSetFitLogScaleYAxis,
                        [GraphsMutation.SetFitLockYAxis]: mockSetFitLockYAxis
                    }
                }
            }
        });
        return shallowMount(GraphSettings, {
            props: { graphIndex, fitPlot },
            global: {
                plugins: [store]
            }
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders as expected when not fit plot", () => {
        const wrapper = getWrapper(1, false, [
            defaultGraphSettings(),
            { lockYAxis: true, logScaleYAxis: true, yAxisRange: [0, 10] }
        ]);
        const labels = wrapper.findAll("label");
        const inputs = wrapper.findAll("input");
        expect(labels.length).toBe(2);
        expect(inputs.length).toBe(2);
        expect(labels[0].text()).toBe("Log scale y axis");
        expect(inputs[0].attributes("type")).toBe("checkbox");
        expect((inputs[0].element as HTMLInputElement).checked).toBe(true);
        expect(labels[1].text()).toBe("Lock y axis");
        expect(inputs[1].attributes("type")).toBe("checkbox");
        expect((inputs[1].element as HTMLInputElement).checked).toBe(true);
    });

    it("renders as expected when fit plot", () => {
        const wrapper = getWrapper(undefined, true, [
            { lockYAxis: true, logScaleYAxis: true, yAxisRange: [0, 10] }
        ]);
        const inputs = wrapper.findAll("input");
        expect((inputs[0].element as HTMLInputElement).checked).toBe(false);
        expect((inputs[1].element as HTMLInputElement).checked).toBe(false);
    });

    it("commits change to log scale y axis setting, when not fit plot", async () => {
        const wrapper = getWrapper(1, false);
        const inputs = wrapper.findAll("input");
        expect((inputs[0].element as HTMLInputElement).checked).toBe(false);
        await inputs[0].setValue(true);
        expect(mockSetLogScaleYAxis).toHaveBeenCalledTimes(1);
        expect(mockSetLogScaleYAxis.mock.calls[0][1]).toStrictEqual({graphIndex: 1, value: true});
        expect(mockSetFitLogScaleYAxis).not.toHaveBeenCalled();
    })

    it("commits change to log scale y axis setting, when fit plot", async () => {
        const wrapper = getWrapper(undefined, true);
        const inputs = wrapper.findAll("input");
        expect((inputs[0].element as HTMLInputElement).checked).toBe(false);
        await inputs[0].setValue(true);
        expect(mockSetFitLogScaleYAxis).toHaveBeenCalledTimes(1);
        expect(mockSetFitLogScaleYAxis.mock.calls[0][1]).toBe(true);
        expect(mockSetLogScaleYAxis).not.toHaveBeenCalled();
    });

    it("commits change to log scale y axis setting, when not fit plot", async () => {
        const wrapper = getWrapper(1, false);
        const inputs = wrapper.findAll("input");
        expect((inputs[1].element as HTMLInputElement).checked).toBe(false);
        await inputs[1].setValue(true);
        expect(mockSetLockYAxis).toHaveBeenCalledTimes(1);
        expect(mockSetLockYAxis.mock.calls[0][1]).toStrictEqual({graphIndex: 1, value: true});
        expect(mockSetFitLockYAxis).not.toHaveBeenCalled();
    });

    it("commits change to log scale y axis setting, when fit plot", async () => {
        const wrapper = getWrapper(undefined, true);
        const inputs = wrapper.findAll("input");
        expect((inputs[1].element as HTMLInputElement).checked).toBe(false);
        await inputs[1].setValue(true);
        expect(mockSetFitLockYAxis).toHaveBeenCalledTimes(1);
        expect(mockSetFitLockYAxis.mock.calls[0][1]).toBe(true);
        expect(mockSetLockYAxis).not.toHaveBeenCalled();
    });
});
