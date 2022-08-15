import {
    SensitivityPlotExtreme,
    SensitivityPlotSettings,
    SensitivityPlotType
} from "../../../../src/app/store/sensitivity/state";
import Vuex from "vuex";
import {mockBasicState} from "../../../mocks";
import {BasicState} from "../../../../src/app/store/basic/state";
import {SensitivityMutation} from "../../../../src/app/store/sensitivity/mutations";
import {shallowMount} from "@vue/test-utils";
import SensitivityPlotOptions from "../../../../src/app/components/options/SensitivityPlotOptions.vue";

describe("SensitivityPlotOptions", () => {
    const plotSettings = {
        plotType: SensitivityPlotType.TraceOverTime,
        extreme: SensitivityPlotExtreme.Min,
        time: 100
    };

    const mockSetPlotType = jest.fn();
    const mockSetPlotExtreme = jest.fn();
    const mockSetPlotTime = jest.fn();

    const getWrapper = (settings: Partial<SensitivityPlotSettings> = {}) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                model: {
                    namespaced: true,
                    state: {
                        endTime: 100
                    }
                },
                sensitivity: {
                    namespaced: true,
                    state: {
                        plotSettings: {...plotSettings, ...settings}
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
        jest.clearAllMocks();
    });

    it("renders as expected for Trace over time", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("#sensitivity-plot-type label").text()).toBe("Type of plot");
        expect((wrapper.find("#sensitivity-plot-type select").element as HTMLSelectElement).value)
            .toBe(SensitivityPlotType.TraceOverTime);
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
        const wrapper = getWrapper({plotType: SensitivityPlotType.ValueAtTime});
        expect((wrapper.find("#sensitivity-plot-type select").element as HTMLSelectElement).value)
            .toBe(SensitivityPlotType.ValueAtTime);

        expect(wrapper.find("#sensitivity-plot-extreme").exists()).toBe(false);

        expect(wrapper.find("#sensitivity-plot-time label").text()).toBe("Time to use");
        expect(wrapper.find("#sensitivity-plot-time input").attributes("type")).toBe("number");
        expect((wrapper.find("#sensitivity-plot-time input").element as HTMLInputElement).value).toBe("100");
    });

    it("renders as expected for Value at min/max", () => {
        const wrapper = getWrapper({plotType: SensitivityPlotType.ValueAtExtreme});
        expect((wrapper.find("#sensitivity-plot-type select").element as HTMLSelectElement).value)
            .toBe(SensitivityPlotType.ValueAtExtreme);
        expect(wrapper.find("#sensitivity-plot-extreme label").text()).toBe("Min/Max");
        expect((wrapper.find("#sensitivity-plot-extreme select").element as HTMLSelectElement).value)
            .toBe(SensitivityPlotExtreme.Min);
        const extremeOptions = wrapper.findAll("#sensitivity-plot-extreme select option");
        expect(extremeOptions.length).toBe(2);
        expect(extremeOptions.at(0)!.text()).toBe(SensitivityPlotExtreme.Min);
        expect(extremeOptions.at(1)!.text()).toBe(SensitivityPlotExtreme.Max);

        expect(wrapper.find("#sensitivity-plot-time").exists()).toBe(false);
    });

    it("renders as expected for Time at value's min/max", () => {
        const wrapper = getWrapper({plotType: SensitivityPlotType.TimeAtExtreme});
        expect((wrapper.find("#sensitivity-plot-type select").element as HTMLSelectElement).value)
            .toBe(SensitivityPlotType.TimeAtExtreme);
        expect(wrapper.find("#sensitivity-plot-extreme label").text()).toBe("Min/Max");
        expect((wrapper.find("#sensitivity-plot-extreme select").element as HTMLSelectElement).value)
            .toBe(SensitivityPlotExtreme.Min);
        const extremeOptions = wrapper.findAll("#sensitivity-plot-extreme select option");
        expect(extremeOptions.length).toBe(2);

        expect(wrapper.find("#sensitivity-plot-time").exists()).toBe(false);
    });
});
