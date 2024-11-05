import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import {
    SensitivityPlotExtreme,
    SensitivityPlotSettings,
    SensitivityPlotType
} from "../../../../src/store/sensitivity/state";
import { mockBasicState } from "../../../mocks";
import { BasicState } from "../../../../src/store/basic/state";
import { SensitivityMutation } from "../../../../src/store/sensitivity/mutations";
import SensitivityPlotOptions from "../../../../src/components/options/SensitivityPlotOptions.vue";
import NumericInput from "../../../../src/components/options/NumericInput.vue";

describe("SensitivityPlotOptions", () => {
    const plotSettings = {
        plotType: SensitivityPlotType.TraceOverTime,
        extreme: SensitivityPlotExtreme.Min,
        time: 100
    };

    const mockSetPlotType = vi.fn();
    const mockSetPlotExtreme = vi.fn();
    const mockSetPlotTime = vi.fn();

    const getWrapper = (settings: Partial<SensitivityPlotSettings> = {}) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                model: {
                    namespaced: true,
                    state: {}
                },
                run: {
                    namespaced: true,
                    state: {
                        endTime: 100
                    }
                },
                sensitivity: {
                    namespaced: true,
                    state: {
                        plotSettings: { ...plotSettings, ...settings }
                    },
                    mutations: {
                        [SensitivityMutation.SetPlotType]: mockSetPlotType,
                        [SensitivityMutation.SetPlotTime]: mockSetPlotTime,
                        [SensitivityMutation.SetPlotExtreme]: mockSetPlotExtreme
                    }
                }
            }
        });

        return shallowMount(SensitivityPlotOptions, {
            global: {
                plugins: [store]
            }
        });
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders as expected for Trace over time", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("#sensitivity-plot-type label").text()).toBe("Type of plot");
        expect((wrapper.find("#sensitivity-plot-type select").element as HTMLSelectElement).value).toBe(
            SensitivityPlotType.TraceOverTime
        );
        const plotTypeOptions = wrapper.findAll("#sensitivity-plot-type select option");
        expect(plotTypeOptions.length).toBe(4);
        expect(plotTypeOptions.at(0)!.attributes("value")).toBe(SensitivityPlotType.TraceOverTime);
        expect(plotTypeOptions.at(0)!.text()).toBe("Trace over time");
        expect(plotTypeOptions.at(1)!.attributes("value")).toBe(SensitivityPlotType.ValueAtTime);
        expect(plotTypeOptions.at(1)!.text()).toBe("Value at a single time");
        expect(plotTypeOptions.at(2)!.attributes("value")).toBe(SensitivityPlotType.ValueAtExtreme);
        expect(plotTypeOptions.at(2)!.text()).toBe("Value at its min/max");
        expect(plotTypeOptions.at(3)!.attributes("value")).toBe(SensitivityPlotType.TimeAtExtreme);
        expect(plotTypeOptions.at(3)!.text()).toBe("Time at value's min/max");

        expect(wrapper.find("#sensitivity-plot-extreme").exists()).toBe(false);
        expect(wrapper.find("#sensitivity-plot-time").exists()).toBe(false);
    });

    it("renders as expected for Value at a single time", () => {
        const wrapper = getWrapper({ plotType: SensitivityPlotType.ValueAtTime });
        expect((wrapper.find("#sensitivity-plot-type select").element as HTMLSelectElement).value).toBe(
            SensitivityPlotType.ValueAtTime
        );

        expect(wrapper.find("#sensitivity-plot-extreme").exists()).toBe(false);

        expect(wrapper.find("#sensitivity-plot-time label").text()).toBe("Time to use");
        const timeInput = wrapper.find("#sensitivity-plot-time").findComponent(NumericInput);
        expect(timeInput.props("value")).toBe(100);
        expect(timeInput.props("minAllowed")).toBe(0);
    });

    it("renders as expected for Value at min/max", () => {
        const wrapper = getWrapper({ plotType: SensitivityPlotType.ValueAtExtreme });
        expect((wrapper.find("#sensitivity-plot-type select").element as HTMLSelectElement).value).toBe(
            SensitivityPlotType.ValueAtExtreme
        );
        expect(wrapper.find("#sensitivity-plot-extreme label").text()).toBe("Min/Max");
        expect((wrapper.find("#sensitivity-plot-extreme select").element as HTMLSelectElement).value).toBe(
            SensitivityPlotExtreme.Min
        );
        const extremeOptions = wrapper.findAll("#sensitivity-plot-extreme select option");
        expect(extremeOptions.length).toBe(2);
        expect(extremeOptions.at(0)!.text()).toBe(SensitivityPlotExtreme.Min);
        expect(extremeOptions.at(1)!.text()).toBe(SensitivityPlotExtreme.Max);

        expect(wrapper.find("#sensitivity-plot-time").exists()).toBe(false);
    });

    it("renders as expected for Time at value's min/max", () => {
        const wrapper = getWrapper({ plotType: SensitivityPlotType.TimeAtExtreme });
        expect((wrapper.find("#sensitivity-plot-type select").element as HTMLSelectElement).value).toBe(
            SensitivityPlotType.TimeAtExtreme
        );
        expect(wrapper.find("#sensitivity-plot-extreme label").text()).toBe("Min/Max");
        expect((wrapper.find("#sensitivity-plot-extreme select").element as HTMLSelectElement).value).toBe(
            SensitivityPlotExtreme.Min
        );
        const extremeOptions = wrapper.findAll("#sensitivity-plot-extreme select option");
        expect(extremeOptions.length).toBe(2);

        expect(wrapper.find("#sensitivity-plot-time").exists()).toBe(false);
    });

    it("updates plot type", async () => {
        const wrapper = getWrapper();
        const plotTypeSelect = wrapper.find("#sensitivity-plot-type select");
        (plotTypeSelect.element as HTMLSelectElement).value = SensitivityPlotType.TimeAtExtreme;
        await plotTypeSelect.trigger("change");

        expect(mockSetPlotType).toHaveBeenCalledTimes(1);
        expect(mockSetPlotType.mock.calls[0][1]).toBe(SensitivityPlotType.TimeAtExtreme);
    });

    it("updates time", async () => {
        const wrapper = getWrapper({ plotType: SensitivityPlotType.ValueAtTime });
        const timeInput = wrapper.find("#sensitivity-plot-time").findComponent(NumericInput);
        await timeInput.vm.$emit("update", 50);

        expect(mockSetPlotTime).toHaveBeenCalledTimes(1);
        expect(mockSetPlotTime.mock.calls[0][1]).toBe(50);
    });

    it("updates extreme type", async () => {
        const wrapper = getWrapper({ plotType: SensitivityPlotType.TimeAtExtreme });
        const extremeSelect = wrapper.find("#sensitivity-plot-extreme select");
        (extremeSelect.element as HTMLSelectElement).value = SensitivityPlotExtreme.Max;
        await extremeSelect.trigger("change");

        expect(mockSetPlotExtreme).toHaveBeenCalledTimes(1);
        expect(mockSetPlotExtreme.mock.calls[0][1]).toBe(SensitivityPlotExtreme.Max);
    });

    it("on mounted, initialises time to model end if null", () => {
        const wrapper = getWrapper({ plotType: SensitivityPlotType.ValueAtTime, time: null });
        expect(mockSetPlotTime).toHaveBeenCalledTimes(1);
        expect(mockSetPlotTime.mock.calls[0][1]).toBe(100);
    });
});
